import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = m.sender.split('@')[0];
            const now = Date.now();
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { coins: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const cooldown = 24 * 60 * 60 * 1000;
            const timePassed = now - userData.daily.lastClaim;

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                return m.reply(`*${config.visuals.emoji2}* \`Espera un poco\` *${config.visuals.emoji2}*\n\nYa has reclamado tu recompensa hoy.\n\n*${config.visuals.emoji} Vuelve en:* ${hours}h ${minutes}m`);
            }

            if (timePassed < cooldown * 2) {
                userData.daily.streak += 1;
            } else {
                userData.daily.streak = 1;
            }

            const reward = 30000 + (userData.daily.streak * 5000);
            const nextReward = 30000 + ((userData.daily.streak + 1) * 5000);

            userData.wallet += reward;
            userData.daily.lastClaim = now;

            db[user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const textoDaily = `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA\` *${config.visuals.emoji3}*\n\n¡Has reclamado tu recompensa de hoy!\n*${config.visuals.emoji4} Ganaste:* ¥${reward.toLocaleString()} Coins\n*${config.visuals.emoji} Racha:* Día ${userData.daily.streak}\n\n> Sigue así, mañana ganarás: *¥${nextReward.toLocaleString()}*`;

            await conn.sendMessage(m.chat, {
                text: textoDaily,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA ECONOMY',
                        body: `Billetera: ¥${userData.coins.toLocaleString()} Coins`,
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\nNo se pudo procesar tu recompensa.`);
        }
    }
};

export default dailyCommand;