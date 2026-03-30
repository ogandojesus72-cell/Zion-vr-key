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
// --- IMPORTACIÓN DE SUB-BOTS ---
import { loadAllSubBots } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// --- VARIABLES GLOBALES ---
global.commands = new Map();
global.totalCommandsUsed = 0; 

// --- FUNCIÓN GLOBAL DE CARGA ---
global.loadCommands = async () => {
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
            console.log(chalk.red(`[ERROR] En ${file}:`), e.message);
        }
    }
    console.log(chalk.cyan(`📊 Comandos cargados correctamente.`));
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

    if (!state.creds.registered) {
        process.stdout.write('\x1Bc');
        CFonts.say('KAZUMA', { font: 'block', align: 'center', colors: ['cyan', 'magenta', 'yellow'] });
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

    await global.loadCommands();

    if (!conn.authState.creds.registered) {
        let phoneNumber = await question(chalk.greenBright('\n -> Introduce tu número: '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan('\n CÓDIGO DE VINCULACIÓN: ') + chalk.bold.white(` ${code} `) + '\n');
            } catch (error) {
                console.error(chalk.red('Error:'), error);
            }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ KAZUMA PRINCIPAL ONLINE'));
            
            // --- ACTIVACIÓN AUTOMÁTICA DE SUB-BOTS ---
            // Al abrir el principal, cargamos todos los sockets secundarios
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