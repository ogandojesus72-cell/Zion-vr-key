import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/gacha/economy.json'); // Misma carpeta como dijiste
const cooldowns = new Map();

const rwCommand = {
    name: 'rw',
    alias: ['roll', 'waifu'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0];
            const ahora = Date.now();
            const tiempoEspera = 10 * 60 * 1000; // 10 minutos

            if (cooldowns.has(user)) {
                const restante = cooldowns.get(user) + tiempoEspera - ahora;
                if (restante > 0) return m.reply(`*${config.visuals.emoji2}* ¡Cálmate fiera! Espera ${Math.ceil(restante / 60000)} min para otro roll.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            
            const saldo = ecoDB[user]?.wallet || 0;
            let keys = Object.keys(gachaDB);

            // Lógica de dificultad para "pobres"
            if (saldo < 45000) {
                const esSuertudo = Math.random() < 0.05; // 5% de probabilidad de leyenda
                if (!esSuertudo) {
                    keys = keys.filter(id => gachaDB[id].value < 40000); // Solo le salen baratos o medios
                }
            }

            const randomId = keys[Math.floor(Math.random() * keys.length)];
            const pj = gachaDB[randomId];
            cooldowns.set(user, ahora);

            let caption = `*» (❍ᴥ❍ʋ) \`GACHA ROLL\` «*\n\n`;
            caption += `*Nombre:* \`${pj.name}\`\n`;
            caption += `*Fuente:* \`${pj.source}\`\n`;
            caption += `*Valor:* ¥${pj.value.toLocaleString()}\n`;
            caption += `*Estado:* ${pj.status === 'libre' ? 'LIBRE' : 'DOMADO'}\n`;
            if (pj.owner) caption += `*Dueño:* @${pj.owner}\n`;
            caption += `\n> Responde a este mensaje con \`#claim\` para intentar comprarlo.`;

            await conn.sendMessage(m.chat, { 
                image: { url: pj.url }, 
                caption: caption,
                mentions: pj.owner ? [pj.owner + '@s.whatsapp.net'] : []
            }, { quoted: m });

        } catch (e) {
            m.reply('Error en el sistema Gacha.');
        }
    }
};

export default rwCommand;