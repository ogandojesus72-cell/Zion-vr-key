/* KURAYAMI TEAM - INDEX ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
   MOD: Validación de vinculación anti-spam
*/

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
import { loadAllSubBots } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();
global.totalCommandsUsed = 0; 

global.loadCommands = async () => {
    process.stdout.write(chalk.cyan('  [⚙️] Cargando módulos de comandos... '));
    const commandsPath = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    global.commands.clear();
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?update=${Date.now()}`);
            if (module.default && module.default.name) {
                global.commands.set(module.default.name, module.default);
            }
        } catch (e) {
            console.log(chalk.red(`\n  [❌] Error en ${file}:`), e.message);
        }
    }
    process.stdout.write(chalk.greenBright(`LISTO (${global.commands.size})\n`));
};

async function startBot() {
    const sessionDir = './sesion_bot';
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    process.stdout.write('\x1Bc');
    CFonts.say('KAZUMA', { 
        font: 'block', align: 'center', colors: ['cyan', 'magenta'], background: 'transparent', letterSpacing: 1 
    });
    console.log(chalk.gray('  ' + '─'.repeat(50)));
    console.log(chalk.cyan('  [📱] SISTEMA:') + chalk.white(` Kazuma Bot Multi-Device`));
    console.log(chalk.cyan('  [👤] DEVELOPER:') + chalk.white(` Félix OFC`));
    console.log(chalk.cyan('  [🛠️] BAILEYS:') + chalk.white(` v${version.join('.')}`));
    console.log(chalk.gray('  ' + '─'.repeat(50)) + '\n');

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

    await global.loadCommands();

    if (!conn.authState.creds.registered) {
        console.log(chalk.yellow('\n  ╔══════════════════════════════════════╗'));
        console.log(chalk.yellow('  ║    VINCULACIÓN DEL BOT PRINCIPAL         ║'));
        console.log(chalk.yellow('  ╚══════════════════════════════════════╝'));

        let phoneNumber = "";
        let isValid = false;

        // --- BUCLE DE VALIDACIÓN ---
        while (!isValid) {
            let input = await question(chalk.cyan('\n  [?] Introduce tu número (ej: 1849XXXXXXX):\n  > '));
            phoneNumber = input.replace(/[^0-9]/g, '');

            if (!phoneNumber || phoneNumber.length < 10) {
                console.log(chalk.red('  [!] ERROR: El número es demasiado corto o inválido.'));
                console.log(chalk.gray('      Asegúrate de incluir el código de país (ej: 57, 1, 507).'));
            } else if (phoneNumber.length > 15) {
                console.log(chalk.red('  [!] ERROR: El número es demasiado largo.'));
            } else {
                // Validación de códigos específicos (ejemplo USA +1)
                if (phoneNumber.startsWith('1') && phoneNumber.length !== 11) {
                    console.log(chalk.yellow('  [!] AVISO: Los números de USA/Canadá deben tener 11 dígitos (1 + 10 dígitos).'));
                    continue; 
                }
                isValid = true; 
            }
        }

        console.log(chalk.blue('\n  [⏳] Solicitando código para: ') + chalk.white(phoneNumber));

        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;

                console.log('\n' + chalk.black.bgCyan('  ╔════════════════════════════════════╗  '));
                console.log(chalk.black.bgCyan(`  ║          CODIGO: ${code}          ║  `));
                console.log(chalk.black.bgCyan('  ╚════════════════════════════════════╝  ') + '\n');

            } catch (error) {
                console.error(chalk.red('  [!] Error de Baileys:'), error.message);
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                process.exit(1);
            }
        }, 2000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const isLoggedOut = lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut;
            if (isLoggedOut) {
                console.log(chalk.red.bold('\n  ┌─────────────────────────────────────┐'));
                console.log(chalk.red.bold('  │       SESIÓN CERRADA / INVALIDADA        │'));
                console.log(chalk.red.bold('  └─────────────────────────────────────┘'));
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                process.exit(0);
            } else {
                console.log(chalk.yellow('  [!] Conexión perdida... reintentando.'));
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.greenBright.bold('\n  [✨] ¡CONECTADO CON ÉXITO!'));
            console.log(chalk.gray('  ' + '─'.repeat(50)));
            await loadAllSubBots(conn);
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (body.startsWith(config.prefix)) {
            global.totalCommandsUsed++;
        } else {
            const firstWord = body.trim().split(/ +/)[0].toLowerCase();
            const exists = global.commands.has(firstWord) || 
                           Array.from(global.commands.values()).some(c => c.alias && c.alias.includes(firstWord));
            if (exists) global.totalCommandsUsed++;
        }

        logger(m, conn);
        await pixelHandler(conn, m, config);
    });
}

startBot();