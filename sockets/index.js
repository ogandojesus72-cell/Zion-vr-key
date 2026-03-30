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
import chalk from 'chalk';
import { socketLogger } from './print.js';
import { pixelHandler } from '../pixel.js';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

// Mapa para gestionar los sockets activos (hasta 60)
global.subBots = new Map();

/**
 * Inicia o reconecta un Sub-Bot
 * @param {string} userId - ID del usuario (ej: 57350... @s.whatsapp.net)
 * @param {object} mainConn - Conexión del bot principal para enviar avisos
 */
export const startSubBot = async (userId, mainConn = null) => {
    const userNumber = userId.split('@')[0];
    const userSessionPath = path.join(sessionsPath, userNumber);
    
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
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

    // Guardamos el socket en el mapa global
    global.subBots.set(userId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(chalk.yellow(`[SUB-BOT] Reconectando: ${userNumber}`));
                startSubBot(userId, mainConn);
            } else {
                console.log(chalk.red(`[SUB-BOT] Sesión cerrada por el usuario: ${userNumber}`));
                
                // Mensaje de despedida (Solo si el bot principal está online)
                if (mainConn) {
                    const despedida = `[✿︎] Hola *${userNumber}*.\n\nGracias por haber formado parte de nuestros sockets. Si algún día quieres volver a ser SubBot de Kazuma, puedes hacerlo con el comando *${config.prefix}code*.\n\n> ¡Nos vemos la próxima vez!`;
                    await mainConn.sendMessage(userId, { text: despedida });
                }
                
                // Limpieza de archivos y mapa
                global.subBots.delete(userId);
                fs.rmSync(userSessionPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[SUB-BOT] ✅ Conectado con éxito: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        // Logs y comandos independientes para el sub-bot
        socketLogger(m, sock);
        await pixelHandler(sock, m, config);
    });

    return sock;
};

/**
 * Función para cargar todos los sub-bots guardados al iniciar el server
 */
export const loadAllSubBots = async (mainConn) => {
    const sessions = fs.readdirSync(sessionsPath);
    console.log(chalk.magenta(`[SISTEMA] Reanudando ${sessions.length} sub-bots...`));
    
    for (const num of sessions) {
        const jid = `${num}@s.whatsapp.net`;
        await startSubBot(jid, mainConn);
    }
};