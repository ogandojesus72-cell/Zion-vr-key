import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    run: async (conn, m) => {
        try {
            const user = (m.quoted ? m.quoted.sender : m.mentionedJid?.[0] || m.sender).split('@')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const total = userData.wallet + userData.bank;

            const texto = `*${config.visuals.emoji3}* \`ESTADO FINANCIERO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Cartera:* ¥${userData.wallet.toLocaleString()}\n*${config.visuals.emoji4} Banco:* ¥${userData.bank.toLocaleString()}\n*${config.visuals.emoji2} Total:* ¥${total.toLocaleString()}\n\n> *Usuario:* @${user}`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [`${user}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al consultar.`);
        }
    }
};

export default balanceCommand;
