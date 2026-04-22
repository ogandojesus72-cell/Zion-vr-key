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
            
            // Cooldown de 9 min
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar de nuevo.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // 1. Prioridad: ID manual (#claim 16)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // 2. Por respuesta (buscando en el pie de foto de la imagen)
            else if (m.quoted) {
                // Intentamos capturar el texto de donde sea que venga (mensaje normal o imagen)
                const quotedMsg = m.quoted.message || m.quoted;
                const caption = m.quoted.text || m.quoted.caption || quotedMsg?.imageMessage?.caption || quotedMsg?.extendedTextMessage?.text || '';
                
                const match = caption.match(/ID\s*»\s*(\d+)/i);
                if (match) pjId = match[1];
            }

            if (!pjId || !gachaDB[pjId]) return m.reply(`*${config.visuals.emoji2}* No detecté el ID. Responde al mensaje o usa #claim (ID).`);
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Ya tiene dueño.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            if (ecoDB[user].wallet < pj.value) return m.reply(`*${config.visuals.emoji2}* No tienes ¥${pj.value.toLocaleString()}.`);

            // Transacción
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}*!`);

        } catch (e) {
            console.error("ERROR EN CLAIM:", e);
            // Si hay un error, el bot responderá esto en lugar de quedarse callado
            m.reply(`*${config.visuals.emoji2}* Fallo interno. Revisa que los archivos JSON existan.`);
        }
    }
};

export default claimCommand;
