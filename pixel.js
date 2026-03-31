/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
   MOD: Lógica de Prefijo Dinámico + LID Sync
*/

import chalk from 'chalk';
import { syncLid } from './lid/resolver.js'; 
import { logger } from './config/print.js'; // Restaurado el logger

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- MOTOR LID (KURAYAMI) ---
        try { 
            m.sender = await syncLid(conn, m, chat); 
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. --- EXTRACCIÓN DE TEXTO COMPLETA (RESTAURADA) ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 3. --- LÓGICA DE PREFIJOS (SOLO MODIFICADO ESTO) ---
        const activePrefix = config.prefix || '#'; 
        // Comprobamos si el mensaje empieza con el prefijo activo
        const isCmd = body.startsWith(activePrefix);
        
        // El nombre del comando se extrae igual, permitiendo la lógica no-prefix
        const commandName = isCmd 
            ? body.slice(activePrefix.length).trim().split(/ +/).shift().toLowerCase() 
            : body.trim().split(/ +/).shift().toLowerCase();
        
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. --- VALIDACIONES DE PODER ---
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat ? chat.endsWith('@g.us') : false;

        // 5. --- LOGGER (RESTAURADO) ---
        logger(m, conn);

        // 6. --- EJECUCIÓN ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Si no hay prefijo, solo permitimos si el comando es noPrefix: true
            if (!isCmd && !cmd.noPrefix) return; 

            if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso denegado.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Solo grupos.');

            await cmd.run(conn, m, { 
                body, 
                prefix: activePrefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red.bold('\n[❌] ERROR EN HANDLER:'), err);
    }
};