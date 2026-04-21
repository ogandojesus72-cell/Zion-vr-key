import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir', 'dar'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender.split('@')[0];
            
            // 1. Detectar al receptor (por respuesta o mención)
            let targetJid = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];

            // 2. Extraer la cantidad limpiando basura (letras, símbolos de mención, etc)
            let amount = args.map(a => a.replace(/[^0-9]/g, '')).find(a => a.length > 0);
            amount = parseInt(amount);

            if (!targetJid || isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nUso: #pay 5000 (mención o responder)\n\n> ¡Asegúrate de indicar una cifra válida!`);
            }

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            // 3. Verificar si el que envía tiene cuenta y saldo suficiente en BANCO
            const senderBank = db[sender]?.bank || 0;

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Banco Insuficiente\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco. Te faltan ¥${(amount - senderBank).toLocaleString()} para completar el envío.\n\n> ¡Trabaja un poco más para poder regalar!`);
            }

            // 4. Asegurar que el receptor tenga perfil en la DB
            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            // 5. Ejecutar transacción de Banco a Banco
            db[sender].bank -= amount;
            db[receiver].bank = (db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA BANCARIA\`\n\n*Emisor:* @${sender}\n*Receptor:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Transacción procesada correctamente de banco a banco!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la transferencia.`);
        }
    }
};

export default payCommand;
