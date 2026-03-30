import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();

// --- FUNCIÓN GLOBAL DE CARGA (Para permitir el comando Update) ---
global.loadCommands = async () => {
    const commandsPath = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

    // Limpiamos el mapa actual para evitar duplicados si se recarga
    global.commands.clear();

    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            // Usamos un timestamp (?update=...) para forzar a Node.js a leer el archivo nuevo
            const module = await import(`${fileUrl}?update=${Date.now()}`);
            
            if (module.default && module.default.name) {
                global.commands.set(module.default.name, module.default);
                console.log(chalk.green(`[OK] Comando cargado: ${module.default.name}`));
            }
        } catch (e) {
            console.log(chalk.red(`[ERROR] Error cargando ${file}:`), e.message);
        }
    }
    console.log(chalk.cyan(`📊 Total de comandos activos: ${global.commands.size}`));
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

    // Mostramos el banner solo si no está registrado
    if (!state.creds.registered) {
        process.stdout.write('\x1Bc');
        CFonts.say('KAZUMA', {
            font: 'block',
            align: 'center',
            colors: ['cyan', 'magenta', 'yellow'],
        });
        console.log(chalk.magenta('┌────────────────────────────────────────────────────────┐'));
        console.log(chalk.magenta('│') + chalk.white('  Seleccione una opción para iniciar el sistema:      ') + chalk.magenta('│'));
        console.log(chalk.magenta('│') + chalk.cyan('  [1] Vincular vía Código de 8 dígitos (Recomendado)  ') + chalk.magenta('│'));
        console.log(chalk.magenta('│') + chalk.red('  [2] Detener y cerrar proceso                        ') + chalk.magenta('│'));
        console.log(chalk.magenta('└────────────────────────────────────────────────────────┘'));

        const input = await question(chalk.yellowBright(' -> Escribe tu opción: '));
        if (input === '2') process.exit();
    }

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
    });

    // Llamamos a la carga de comandos inicial
    console.log(chalk.blue('⚙️ Cargando comandos de la carpeta /comandos...'));
    await global.loadCommands();

    if (!conn.authState.creds.registered) {
        console.log(chalk.cyan('\n Introduce tu número SIN el símbolo (+).'));
        let phoneNumber = await question(chalk.greenBright(' -> Número: '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan('\n CÓDIGO DE VINCULACIÓN: ') + chalk.bold.white(` ${code} `) + '\n');
            } catch (error) {
                console.error(chalk.red('Error generando código:'), error);
            }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ KAZUMA ONLINE - Sesión lista.'));
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;
        
        // Logger de consola personalizado
        logger(m, conn);
        
        // Manejador de comandos (pixel.js)
        await pixelHandler(conn, m, config);
    });
}

startBot();