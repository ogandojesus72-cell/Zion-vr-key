/* KURAYAMI TEAM - PIXEL HANDLER (MASTER FIX) */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { logger } from './config/print.js';

// Rutas absolutas para evitar errores entre procesos de PM2
const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const sessionsPath = path.join(process.cwd(), 'sesiones_subbots');

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const sender = m.sender || m.key.participant || m.key.remoteJid;
        const misIdentidades = config.owner || [];
        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body) return;

        // --- GESTIÓN DE PREFIJOS ---
        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const foundPrefix = allPrefixes.find(p => body.startsWith(p));

        /* FIX CRÍTICO: Si se usa un prefijo, se mantiene. 
           Si es 'noPrefix', se asigna '#' por defecto para evitar el 'undefined' en los textos.
        */
        const usedPrefix = foundPrefix ? foundPrefix : '#';

        let commandName = foundPrefix 
            ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        // --- LÓGICA DE BOT PRIMARIO ---
        if (isGroup) {
            const comandosGestion = ['setprimary', 'delprimary'];

            if (!comandosGestion.includes(commandName)) {
                const myJid = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');

                if (fs.existsSync(databasePath)) {
                    let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));

                    if (db[chat]) {
                        const primaryNumber = db[chat].replace(/[^0-9]/g, '');
                        const isSubActive = fs.existsSync(path.join(sessionsPath, primaryNumber));

                        if (isSubActive || primaryNumber === myJid) {
                            if (myJid !== primaryNumber) return; 
                        } else {
                            delete db[chat];
                            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
                        }
                    }
                }
            }
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (!cmd) return;
        
        // El bot responde si hay prefijo real O si el comando es noPrefix
        if (!foundPrefix && !cmd.noPrefix) return;

        if (!isGroup && !isOwner && commandName !== 'code') return;

        if (cmd.isOwner && !isOwner) {
            return m.reply(`*❁* \`ACCESO DENEGADO\` *❁*\n\nID: \`${sender}\`\n\n> ¡Solo mi desarrollador puede usar esto!`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply('*✿︎* \`Aviso\` *✿︎*\n\nEste comando solo puede ser utilizado en grupos.\n\n> ¡Inténtalo en un chat grupal!');
        }

        logger(m, conn);

        /* PASO DE ARGUMENTOS AL COMANDO:
           Pasamos 'usedPrefix' para que cubra tanto la variable 'usedPrefix' como 'prefix'.
        */
        await cmd.run(conn, m, args, usedPrefix, commandName, text, usedPrefix);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};