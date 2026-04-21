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

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = m.sender.split('@')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            let amount = args[0];

            if (!amount) return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\` *${config.visuals.emoji2}*\n\nIndica una cantidad o usa *all*.\n*Ejemplo:* ${usedPrefix}dep 5000`);

            if (amount.toLowerCase() === 'all') {
                amount = userData.wallet;
            } else {
                amount = parseInt(amount.replace(/[^0-9]/g, ''));
            }

            if (!amount || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Ingresa una cantidad válida.`);
            if (userData.wallet < amount) return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu cartera.`);

            userData.wallet -= amount;
            userData.bank += amount;

            db[user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3}* \`DEPÓSITO EXITOSO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Monto:* ¥${amount.toLocaleString()}\n*${config.visuals.emoji} Banco:* ¥${userData.bank.toLocaleString()}\n\n> Has guardado tus coins de forma segura.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar el depósito.`);
        }
    }
};

export default depCommand;