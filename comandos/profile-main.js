import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/profiles.json');

const profileCommand = {
    name: 'profile',
    alias: ['perfil', 'me'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender);
            const user = targetJid.split('@')[0].split(':')[0];
            
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            const data = db[user] || {};

            let pp;
            try { pp = await conn.profilePictureUrl(targetJid, 'image'); } catch { pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; }

            let txt = `*${config.visuals.emoji3} \`PERFIL DE USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✿︎ Usuario:* @${user}\n`;
            txt += `*✿︎ Género:* ${data.genre || 'No definido'}\n`;
            txt += `*✿︎ Cumpleaños:* ${data.birth || 'No definido'}\n`;
            txt += `*✿︎ Pareja:* ${data.partner ? '@' + data.partner : 'Soltero/a'}\n`;
            txt += `*✿︎ Fav PJ:* ${data.favPj || 'Ninguno'}\n\n`;
            txt += `> ¡Usa los comandos de profile para editar tu info!`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: [targetJid, (data.partner ? data.partner + '@s.whatsapp.net' : '')] 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;
