/* KURAYAMI TEAM - PIXEL HANDLER (DIAGNÓSTICO ACTIVO) 
   Lógica: Identidad Dual + Alerta de Rango
*/

import chalk from 'chalk';
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const sender = m.sender || m.key.participant || m.key.remoteJid;
        
        // 🛡️ --- LAS LLAVES MAESTRAS DE FÉLIX ---
        const misIdentidades = [
            '573508941325@s.whatsapp.net', // Tu JID (Privado)
            '125860308893859@lid'          // Tu LID (Grupo)
        ];

        // Comprobación directa
        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // --- MURO DE PRIVADO ---
        if (!isGroup && !isOwner) {
            if (body.toLowerCase() !== 'code') return; 
        }

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));
        
        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            if (!usedPrefix && !cmd.noPrefix) return;

            // 🔱 --- EL "CHISMOSO" DE SEGURIDAD ---
            if (cmd.isOwner && !isOwner) {
                // Si el bot te responde esto, es que NO reconoció tu LID/JID actual
                return m.reply(`🚫 *ACCESO DENEGADO*\n\nTu ID actual: \`${sender}\` no está en la lista de dueños de **Kurayami Host**.\n\n_Si eres el dueño, verifica que este ID coincida con el código._`);
            }

            if (cmd.isGroup && !isGroup) return m.reply('❌ Comando solo para grupos.');

            logger(m, conn);
            await cmd.run(conn, m, { 
                body, 
                prefix: config.prefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red('[ERROR]'), err);
    }
};