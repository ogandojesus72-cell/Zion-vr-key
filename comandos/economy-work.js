import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { workFrases } from './frases/work.js';

const dbPath = path.resolve('./config/database/economy/economy.json');
const workCooldowns = new Map();

const workCommand = {
    name: 'work',
    alias: ['chamba', 'trabajar'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0];
            const now = Date.now();
            const cooldown = 5 * 60 * 1000;

            if (workCooldowns.has(user) && (now < workCooldowns.get(user) + cooldown)) {
                const rem = workCooldowns.get(user) + cooldown - now;
                return m.reply(`*${config.visuals.emoji2}* \`Descanso\`\n\nDebes esperar ${Math.floor(rem / 1000)}s para volver a chambear.\n\n> ¡El esfuerzo constante trae recompensas!`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };

            const reward = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
            const frase = workFrases[Math.floor(Math.random() * workFrases.length)];

            db[user].wallet += reward;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            workCooldowns.set(user, now);

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`CHAMBA EXITOSA\`\n\n${frase}\n*${config.visuals.emoji} Ganaste:* ¥${reward.toLocaleString()}\n\n> ¡Tu trabajo ayuda a crecer el imperio!`
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la chamba.`);
        }
    }
};

export default workCommand;
