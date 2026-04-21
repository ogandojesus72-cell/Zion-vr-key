import { config } from '../config.js';
import { crimeFrases, failFrases } from './frases/crimen.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const crimeCommand = {
    name: 'crime',
    alias: ['crimen', 'asaltar'],
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
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const cooldown = 20 * 60 * 1000;
            const timePassed = now - (userData.crime?.lastUsed || 0);

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                const minutes = Math.floor(remaining / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                return m.reply(`*${config.visuals.emoji2}* \`Bajo vigilancia\` *${config.visuals.emoji2}*\n\nEspera ${minutes}m ${seconds}s para volver a cometer un crimen.`);
            }

            const isSuccess = Math.random() > 0.3; 

            if (isSuccess) {
                const randomCrime = crimeFrases[Math.floor(Math.random() * crimeFrases.length)];
                const reward = Math.floor(Math.random() * (randomCrime.max - randomCrime.min + 1)) + randomCrime.min;

                userData.wallet += reward;
                userData.crime = { lastUsed: now };

                db[user] = userData;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

                const textoExito = `*${config.visuals.emoji3}* \`CRIMEN EXITOSO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4}* ${randomCrime.text}\n\n*${config.visuals.emoji} Ganaste:* ¥${reward.toLocaleString()} Coins\n\n> Tu cartera ahora tiene: *¥${userData.wallet.toLocaleString()}*`;

                await conn.sendMessage(m.chat, {
                    text: textoExito,
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - CRIME CITY',
                            body: `Dinero en cartera: ¥${userData.wallet.toLocaleString()}`,
                            thumbnailUrl: config.visuals.img1,
                            mediaType: 1,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });
            } else {
                userData.crime = { lastUsed: now };
                db[user] = userData;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                const randomFail = failFrases[Math.floor(Math.random() * failFrases.length)];
                m.reply(`*${config.visuals.emoji2}* \`OPERACIÓN FALLIDA\` *${config.visuals.emoji2}*\n\n${randomFail}\n\n> No lograste conseguir nada esta vez.`);
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\nNo se pudo procesar el crimen.`);
        }
    }
};

export default crimeCommand;