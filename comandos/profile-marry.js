import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');
const proposals = new Map();

const marryCommand = {
    name: 'marry',
    alias: ['casar', 'acceptmarry'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) return m.reply('No tienes propuestas.');
                const prop = proposals.get(m.quoted.id);
                if (m.sender !== prop.to) return m.reply('No es para ti.');

                casados[user] = prop.from;
                casados[prop.from] = user;

                fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3}* ¡Felicidades! Se han casado.`, { mentions: [m.sender, prop.fromJid] });
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply('Menciona a alguien.');

            const target = targetJid.split('@')[0].split(':')[0];

            if (!genres[user] || !genres[target]) return m.reply('Ambos deben tener género establecido (#setgenre).');
            if (genres[user] === genres[target]) return m.reply('Solo se permite hombre con mujer.');
            if (casados[user] || casados[target]) return m.reply('Uno de los dos ya está casado.');

            const sent = await conn.sendMessage(m.chat, { 
                text: `@${user} te pide matrimonio. #marry accept para aceptar.`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: user, fromJid: m.sender, to: targetJid });

        } catch (e) {
            m.reply('Error en el sistema de matrimonio.');
        }
    }
};

export default marryCommand;