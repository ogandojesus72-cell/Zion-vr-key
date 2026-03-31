/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import chalk from 'chalk';
import { syncLid } from './lid/resolver.js'; 

export const pixelHandler = async (conn, m, config) => {
    try {
        const chat = m.key.remoteJid;
        
        // 1. LID Sync
        try { m.sender = await syncLid(conn, m, chat); } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. Extraer Body (Igual que en tu index para ser coherentes)
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        
        // Lógica de comando con/sin prefijo
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : body.trim().split(/ +/).shift().toLowerCase();
        
        // 3. Validaciones
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat.endsWith('@g.us');

        // 4. Ejecución desde global.commands (Donde el index guarda todo)
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Portería de permisos
            if (cmd.isOwner && !isOwner) return m.reply('❌ Solo Desarrollador.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Solo Grupos.');

            // Ejecución
            await cmd.run(conn, m, { prefix, isOwner, isGroup, config });
        }

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};