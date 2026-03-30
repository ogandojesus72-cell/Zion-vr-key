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
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

// Importaciones internas (Crearemos estos archivos luego)
import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Colección global para comandos (Acceso rápido desde cualquier parte)
global.commands = new Map();

const printBanner = () => {
    process.stdout.write('\x1Bc'); // Limpia la pantalla para que sea estético
    CFonts.say('KAZUMA', {
        font: 'block',
        align: 'center',
        colors: ['cyan', 'magenta', 'yellow'],
        letterSpacing: 1,
        lineHeight: 1,
        space: false,
    });

    console.log(chalk.magenta('┌────────────────────────────────────────────────────────┐'));
    console.log(chalk.magenta('│') + chalk.white('  Seleccione una opción para iniciar el sistema:      ') + chalk.magenta('│'));
    console.log(chalk.magenta('│') + chalk.cyan('  [1] Vincular vía Código de 8 dígitos (Recomendado)  ') + chalk.magenta('│'));
    console.log(chalk.magenta('│') + chalk.red('  [2] Detener y cerrar proceso                        ') + chalk.magenta('│'));
    console.log(chalk.magenta('└────────────────────────────────────────────────────────┘'));
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

    // Solo mostramos el menú si NO hay una sesión guardada
    if (!state.creds.registered) {
        printBanner();
        const input = await question(chalk.yellowBright(' -> Escribe tu opción: '));

        if (input === '2') {
            console.log(chalk.red('❌ Operación cancelada.'));
            process.exit();
        }
        if (input !== '1') {
            console.log(chalk.red('⚠️ Opción inválida. Reintentando...'));
            return startBot();
        }
    }

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'), // Necesario para que el código funcione bien
        markOnlineOnConnect: true,
    });

    // Lógica de Vinculación por Código (Pairing Code)
    if (!conn.authState.creds.registered) {
        console.log(chalk.cyan('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        console.log(chalk.cyan('┃') + chalk.white(' Introduce tu número SIN el símbolo (+).           ') + chalk.cyan('┃'));
        console.log(chalk.cyan('┃') + chalk.yellow(' Ejemplo: 18093527611                              ') + chalk.cyan('┃'));
        console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        
        let phoneNumber = await question(chalk.greenBright(' -> Número: '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber) {
            console.log(chalk.red('❌ Número no válido. Reinicia el bot.'));
            process.exit();
        }

        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan('\n CÓDIGO DE VINCULACIÓN: ') + chalk.bold.white(` ${code} `) + '\n');
            } catch (error) {
                console.error(chalk.red('Error al solicitar el código:'), error);
            }
        }, 3000);
    }

    // --- CARGADOR DE COMANDOS AUTOMÁTICO ---
    const loadCommands = async (dir) => {
        const fullDir = path.join(__dirname, dir);
        if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
        
        const files = fs.readdirSync(fullDir);
        for (const file of files) {
            const filePath = path.join(fullDir, file);
            if (fs.statSync(filePath).isDirectory()) {
                await loadCommands(path.join(dir, file));
            } else if (file.endsWith('.js')) {
                try {
                    const module = await import(`file://${filePath}?update=${Date.now()}`);
                    const command = module.default;
                    if (command?.name) {
                        global.commands.set(command.name, command);
                    }
                } catch (e) {
                    console.log(chalk.red(`Error cargando: ${file}`), e);
                }
            }
        }
    };

    console.log(chalk.blue('⚙️ Cargando módulos y comandos...'));
    await loadCommands('comandos');

    // Eventos de la Conexión
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ CONECTADO CON ÉXITO: Kazuma Multi-Device está activo.'));
        }
    });

    // Escuchador de Mensajes
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        // Mostrar actividad en consola (config/print.js)
        logger(m, conn);

        // Handler de comandos (pixel.js)
        await pixelHandler(conn, m, config);
    });
}

startBot();