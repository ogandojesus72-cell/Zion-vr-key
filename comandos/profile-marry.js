import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/profiles.json');
const proposals = new Map();

const marryCommand = {
    name: 'marry',
    alias: ['casar', 'divorce', 'divorcio'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (m.body.includes('divorce')) {
                if (!db[user]?.partner) return m.reply(`*${config.visuals.emoji2}* No estás casado.`);
                const ex = db[user].partner;
                db[user].partner = null;
                if (db[ex]) db[ex].partner = null;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji3}* Te has divorciado de @${ex}.`, { mentions: [ex + '@s.whatsapp.net'] });
            }

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) return m.reply(`*${config.visuals.emoji2}* No hay propuestas pendientes.`);
                const prop = proposals.get(m.quoted.id);
                if (m.sender !== prop.to) return m.reply(`*${config.visuals.emoji2}* Esta propuesta no es para ti.`);
                
                db[user].partner = prop.fromId;
                if (!db[prop.fromId]) db[prop.fromId] = {};
                db[prop.fromId].partner = user;

                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3}* ¡Felicidades! @${user} y @${prop.fromId} ahora están casados.`, { mentions: [m.sender, prop.from] });
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para proponer matrimonio.`);
            if (targetJid === m.sender) return m.reply(`*${config.visuals.emoji2}* No puedes casarte contigo mismo.`);

            const target = targetJid.split('@')[0].split(':')[0];
            const uData = db[user] || {};
            const tData = db[target] || {};

            if (!uData.genre || !uData.age) return m.reply(`*${config.visuals.emoji2}* Debes establecer tu género y edad antes de casarte.`);
            if (!tData.genre || !tData.age) return m.reply(`*${config.visuals.emoji2}* La otra persona no ha establecido su género o edad.`);

            if (uData.age < 18 || tData.age < 18) return m.reply(`*${config.visuals.emoji2}* Ambos deben ser mayores de 18 años para casarse.`);
            if (uData.genre === tData.genre) return m.reply(`*${config.visuals.emoji2}* Matrimonio denegado. Solo se permite el matrimonio entre un hombre y una mujer.`);
            if (uData.partner) return m.reply(`*${config.visuals.emoji2}* Ya estás casado.`);
            if (tData.partner) return m.reply(`*${config.visuals.emoji2}* Esa persona ya está casada.`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE MATRIMONIO\` ${config.visuals.emoji3}*\n\n@${user} te pide matrimonio. ¿Aceptas?\n\n> Tienes 5 minutos para responder con: *#marry accept*`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: m.sender, fromId: user, to: targetJid });
            setTimeout(() => proposals.delete(sent.key.id), 300000);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de matrimonio.`);
        }
    }
};

export default marryCommand;
