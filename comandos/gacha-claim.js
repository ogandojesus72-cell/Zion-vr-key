import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { lastRoll } from './gacha-rw.js'; // Importamos la memoria del roll

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const chat = m.chat;
            const ahora = Date.now();
            
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // --- EL ENGAÑO ---
            // 1. Si puso ID manual (#claim 11)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // 2. Si respondió al mensaje, usamos lo que anotó el RW
            else if (m.quoted) {
                pjId = lastRoll.get(chat); // El bot "recuerda" qué ID mandó al chat
            }

            if (!pjId || !gachaDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* No sé qué quieres reclamar. Usa #rw primero.`);
            }
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Ya es de alguien más.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            if (ecoDB[user].wallet < pj.value) return m.reply(`*${config.visuals.emoji2}* No tienes ¥${pj.value.toLocaleString()}`);

            // Transacción
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Lograste domar a *${pj.name}*!`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el reclamo.`);
        }
    }
};

export default claimCommand;
