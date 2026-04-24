import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const marryPath = path.resolve('./config/database/profile/casados.json');

const divorceCommand = {
    name: 'divorce',
    alias: ['divorcio', 'separarse'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));

            if (!casados[user]) {
                return m.reply(`*${config.visuals.emoji2}* No estás casado con nadie actualmente.`);
            }

            const pareja = casados[user];

            delete casados[user];
            delete casados[pareja];

            fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));

            const aviso = `*☹︎ DIVORCIO CONFIRMADO ☹︎*\n\n@${user} ha decidido terminar el matrimonio. Ahora ambos están solteros.`;
            
            await conn.sendMessage(m.chat, { 
                text: aviso, 
                mentions: [m.sender, pareja + '@s.whatsapp.net'] 
            }, { quoted: m });

        } catch (e) {
            m.reply('Error al procesar el divorcio.');
        }
    }
};

export default divorceCommand;