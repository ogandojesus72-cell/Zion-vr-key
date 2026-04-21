import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidNormalizedUser,
    downloadContentFromMessage
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

global.subBots = new Map();

export const startSubBot = async (userId, mainConn = null) => {
    const jid = jidNormalizedUser(userId);
    const userNumber = jid.split('@')[0];
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
        browser: Browsers.macOS('Safari'), 
        markOnlineOnConnect: true,
    });

    global.subBots.set(jid, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                setTimeout(() => startSubBot(jid, mainConn), 5000);
            } else {
                global.subBots.delete(jid);
                if (fs.existsSync(userSessionPath)) fs.rmSync(userSessionPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[SUB-BOT] ✅ Conectado: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message) return;

        // --- LÓGICA AUTO-LECTURA SUB-BOT ---
        const bodyText = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
        const prefixes = config.allPrefixes || ['#', '!', '.'];
        const isCmd = prefixes.some(p => bodyText.startsWith(p));

        if (m.key.fromMe && !isCmd) return;
        // ------------------------------------

        m.chat = m.key.remoteJid;
        const msgType = Object.keys(m.message)[0];
        const msgContent = m.message[msgType];
        const contextInfo = msgContent?.contextInfo;

        if (contextInfo?.quotedMessage) {
            const type = Object.keys(contextInfo.quotedMessage)[0];
            const q = contextInfo.quotedMessage[type];
            m.quoted = {
                type,
                msg: q,
                mimetype: q?.mimetype || '',
                message: contextInfo.quotedMessage,
                download: () => downloadContentFromMessage(q, type.replace('Message', ''))
            };
        } else {
            m.quoted = null;
        }

        socketLogger(m, sock);
        await pixelHandler(sock, m, config);
    });

    return sock;
};

export const loadAllSubBots = async (mainConn) => {
    try {
        const sessions = fs.readdirSync(sessionsPath);
        for (const num of sessions) {
            const jid = `${num}@s.whatsapp.net`;
            await new Promise(resolve => setTimeout(resolve, 3000));
            startSubBot(jid, mainConn);
        }
    } catch (err) {}
};