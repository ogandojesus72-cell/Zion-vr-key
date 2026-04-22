import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

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
            const ahora = Date.now();
            
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar de nuevo.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // 1. Prioridad: ID manual (#claim 11)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // 2. Rastreo profundo en la respuesta
            else if (m.quoted) {
                // Buscamos en todas las posibles ubicaciones del texto en un mensaje citado
                const q = m.quoted;
                const textoCita = q.text || q.caption || q.message?.imageMessage?.caption || q.message?.extendedTextMessage?.text || q.message?.videoMessage?.caption || '';
                
                // Buscamos el ID ignorando negritas, espacios y saltos de línea
                const match = textoCita.match(/ID\s*»\s*(\d+)/i);
                if (match && match[1]) {
                    pjId = match[1];
                }
            }

            if (!pjId || !gachaDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* No detecté el ID. Responde al mensaje o usa #claim (ID).`);
            }
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Este ya tiene dueño.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            const saldo = ecoDB[user].wallet || 0;

            if (saldo < pj.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero. Cuesta ¥${pj.value.toLocaleString()}`);
            }

            // Transacción
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}*! Pagaste ¥${pj.value.toLocaleString()}.`);

        } catch (e) {
            console.error("ERROR EN CLAIM:", e);
            m.reply(`*${config.visuals.emoji2}* Fallo interno al procesar el reclamo.`);
        }
    }
};

export default claimCommand;
