import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (!body || !body.trim()) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? m.key.participant : from;

        // --- LÓGICA DE OWNER MEJORADA ---
        // Limpiamos el ID del sender para quedarnos solo con los números
        const senderNumber = sender.split('@')[0];
        // Comparamos con la lista en config.js
        const isOwner = config.owner.some(num => num.replace(/[^0-9]/g, '') === senderNumber);

        if (!isGroup && !isOwner) return; 

        const prefix = config.prefix;
        const text = body.trim();
        const isCmd = text.startsWith(prefix);
        
        const commandText = isCmd 
            ? text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase() 
            : text.split(/ +/)[0].toLowerCase();
        
        const args = text.trim().split(/ +/).slice(1);

        const cmd = global.commands.get(commandText) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandText));
        
        if (!cmd) return;

        let groupMetadata, participants, isAdmin = false;
        if (isGroup) {
            groupMetadata = await conn.groupMetadata(from);
            participants = groupMetadata.participants;
            isAdmin = participants.filter(v => v.admin !== null).map(v => v.id).includes(sender);
        }

        // VALIDACIONES
        if (cmd.isOwner && !isOwner) {
            return await conn.sendMessage(from, { text: '⚠️ *Acceso denegado:* Este comando es exclusivo de mi desarrollador.' }, { quoted: m });
        }
        
        if (cmd.isGroup && !isGroup) return;
        
        if (cmd.isAdmin && !isAdmin && isGroup) {
            return await conn.sendMessage(from, { text: '❌ *Solo Admins.*' }, { quoted: m });
        }

        await cmd.run(conn, m, {
            args,
            prefix,
            command: commandText,
            isOwner,
            isAdmin,
            isGroup,
            participants,
            groupMetadata
        });

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL-HANDLER]:'), err);
    }
};