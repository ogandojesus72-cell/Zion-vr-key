import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

const profileCommand = {
    name: 'profile',
    alias: ['perfil'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, command, text) => {
        const from = m.key.remoteJid;
        const eCoins = config.visuals?.emoji5 || '🪙';

        // Detectar si mencionaste a alguien o respondiste a un mensaje
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
        const userNumber = who.split('@')[0];
        const dailyFile = path.join(dbPath, userNumber, 'daily.json');

        let data = { totalCoins: 0, usedCommands: 0 };
        if (fs.existsSync(dailyFile)) {
            data = JSON.parse(fs.readFileSync(dailyFile));
        }

        const name = await conn.getName(who);
        let pp;
        try {
            pp = await conn.profilePictureUrl(who, 'image');
        } catch {
            pp = 'https://files.catbox.moe/9ssbf9.jpg'; 
        }

        const profileText = `*👤 PERFIL DE USUARIO*\n\n` +
            `Nombre » *${name}*\n` +
            `🔢 Número » *${userNumber}*\n` +
            `🕹️ Comandos » *${data.usedCommands}*\n\n` +
            `*🪙 ECONOMIA*\n\n` +
            `${eCoins} Coins totales » *${data.totalCoins.toLocaleString()}*\n\n` +
            `> Kurayami Team System`;

        await conn.sendMessage(from, { image: { url: pp }, caption: profileText }, { quoted: m });
    }
};

export default profileCommand;