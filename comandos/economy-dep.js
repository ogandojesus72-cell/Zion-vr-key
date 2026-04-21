import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const depCommand = {
    name: 'deposit',
    alias: ['dep', 'd', 'depositar'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            let amount = args[0];

            if (!amount) return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nIngresa una cantidad o usa *all*.\n*Ejemplo:* #dep 5000`);

            if (amount.toLowerCase() === 'all') {
                amount = userData.wallet;
            } else {
                amount = parseInt(amount.replace(/[^0-9]/g, ''));
            }

            if (!amount || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Cantidad inválida.`);
            if (userData.wallet < amount) return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en cartera.`);

            userData.wallet -= amount;
            userData.bank += amount;
            db[user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`DEPÓSITO EXITOSO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Guardado:* ¥${amount.toLocaleString()}\n*${config.visuals.emoji} Banco:* ¥${userData.bank.toLocaleString()}\n\n> *Billetera:* ¥${userData.wallet.toLocaleString()}`
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el depósito.`);
        }
    }
};

export default depCommand;
