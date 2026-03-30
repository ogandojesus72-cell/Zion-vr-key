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

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

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

    // CARGADOR PLANO (Solo archivos dentro de comandos/)
    const loadCommands = async () => {
        const commandsPath = path.resolve(__dirname, 'comandos');
        if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of files) {
            try {
                const filePath = path.join(commandsPath, file);
                const fileUrl = pathToFileURL(filePath).href;
                const module = await import(`${fileUrl}?update=${Date.now()}`);
                
                if (module.default && module.default.name) {
                    global.commands.set(module.default.name, module.default);
                    console.log(chalk.green(`[OK] Comando: ${module.default.name}`));
                }
            } catch (e) {
                console.log(chalk.red(`[ERROR] En ${file}:`), e.message);
            }
        }
    };

    console.log(chalk.blue('⚙️ Cargando comandos de la carpeta /comandos...'));
    await loadCommands();

    if (!conn.authState.creds.registered) {
        // ... (Tu código de banner y pairing code igual que antes)
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ KAZUMA ONLINE - Comandos cargados: ' + global.commands.size));
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;
        logger(m, conn);
        await pixelHandler(conn, m, config);
    });
}

startBot();