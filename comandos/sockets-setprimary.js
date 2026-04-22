import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'preferencias.json');
const sessionsPath = path.resolve('./sesiones_subbots');
const mainSessionPath = path.resolve('./sesion_bot');

const setPrimary = {
    name: 'setprimary',
    alias: ['setprimary', 'principal', 'solotu'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args) => {
        const from = m.chat;

        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }

        let db = {};
        if (fs.existsSync(databasePath)) {
            try {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            } catch (e) {
                db = {};
            }
        }

        if (db[from]) {
            return await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`ACCIÓN DENEGADA\`\n\nYa existe un bot primario asignado (\`${db[from]}\`) en este grupo.\n\n> ¡Usa delprimary para removerlo!` 
            }, { quoted: m });
        }

        let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                        m.message?.extendedTextMessage?.contextInfo?.participant;

        if (!targetJid) {
            return await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`Error de asignación\`\n\nDebes mencionar a un Bot o responder a su mensaje.` 
            }, { quoted: m });
        }

        const targetNumber = targetJid.split('@')[0].split(':')[0].replace(/\D/g, '');
        const myNumber = conn.user.id.split(':')[0].split('@')[0].replace(/\D/g, '');

        const isMain = fs.existsSync(mainSessionPath);
        const isSub = fs.existsSync(path.join(sessionsPath, targetNumber));

        if (targetNumber !== myNumber && !isSub) {
             return await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`Bot no encontrado\`\n\nEl número \`${targetNumber}\` no es un Bot con sesión activa.` 
            }, { quoted: m });
        }

        db[from] = targetNumber;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*${config.visuals.emoji3}* \`CONFIGURACIÓN EXITOSA\`\n\nSe ha elegido al socket *${targetNumber}* como bot primario del grupo.` 
        }, { quoted: m });
    }
};

export default setPrimary;