/* KURAYAMI TEAM - ECONOMY SYSTEM (DAILY)
   Versión corregida para evitar error 'split'
*/

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

// --- HELPERS LÓGICOS DE TU BASE ---
const toMs = (h = 0, m = 0, s = 0) => ((h * 3600) + (m * 60) + s) * 1000;
const formatDelta = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
};

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m) => {
        // --- SOLUCIÓN AL ERROR 'SPLIT' ---
        // Buscamos el sender en todas las posiciones posibles para que no sea undefined
        const sender = m.sender || m.key?.participant || m.key?.remoteJid || '';
        if (!sender) return console.log('[ERROR] No se pudo determinar el remitente');

        const from = m.key.remoteJid;
        const userNumber = sender.split('@')[0]; // Aquí es donde fallaba antes
        
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;
        const eCoins = config.visuals.emoji5;
        const img = config.visuals.img1;

        const userDir = path.join(dbPath, userNumber);
        const dailyFile = path.join(userDir, 'daily.json');

        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0 };
        if (fs.existsSync(dailyFile)) {
            data = JSON.parse(fs.readFileSync(dailyFile));
        }

        const now = Date.now();
        const cd = toMs(24, 0, 0); 

        if (now - (data.lastDaily || 0) < cd) {
            const rem = (data.lastDaily || 0) + cd - now;
            return conn.sendMessage(from, { 
                image: { url: img },
                caption: `*${e1}* Espera *${formatDelta(rem)}* para volver a reclamar una recompensa diaria.\n\n> ¡No creas que me dejaré engañar!` 
            }, { quoted: m });
        }

        const coinsGained = data.nextReward || 1000;
        data.totalCoins = (data.totalCoins || 0) + coinsGained;
        data.lastDaily = now;
        data.nextReward = coinsGained * 2;

        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const txt = `*${e1} \`RECOMPENSA DIARIA\` ${e1}*\n\n` +
                    `${eCoins} Coins añadidos: *${coinsGained.toLocaleString()}*\n` +
                    `${e2} Próxima recompensa: *${data.nextReward.toLocaleString()}*\n\n` +
                    `> ¡Vuelve mañana y gana coins como un genio!`;

        await conn.sendMessage(from, { image: { url: img }, caption: txt }, { quoted: m });
    }
};

export default dailyCommand;
