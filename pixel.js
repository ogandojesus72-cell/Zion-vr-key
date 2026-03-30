import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        // Detectar el tipo de mensaje y extraer el cuerpo del texto
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        // Si no hay texto, ignoramos el mensaje
        if (!body || !body.trim()) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // --- LÓGICA ANTI-LID / JID ---
        // Obtenemos quién envía el mensaje (en grupos m.key.participant puede ser LID)
        const sender = isGroup ? m.key.participant : from;
        
        // Limpiamos el ID: nos quedamos solo con los números (ej: 573508941325)
        const senderNumber = sender.replace(/[^0-9]/g, '');

        // Verificamos si el número limpio está en la lista de owner de config.js
        const isOwner = config.owner.some(num => num.replace(/[^0-9]/g, '') === senderNumber);

        // Filtro de Seguridad: En privado, el bot solo responde al Owner
        if (!isGroup && !isOwner) return; 

        const prefix = config.prefix;
        const text = body.trim();
        const isCmd = text.startsWith(prefix);
        
        // Extraer el nombre del comando
        const commandText = isCmd 
            ? text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase() 
            : text.split(/ +/)[0].toLowerCase();
        
        const args = text.trim().split(/ +/).slice(1);

        // Buscar el comando por nombre o alias en el mapa global
        const cmd = global.commands.get(commandText) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandText));
        
        // Si el comando no existe, no hacemos nada
        if (!cmd) return;

        // Obtener datos del grupo si aplica
        let groupMetadata, participants, isAdmin = false;
        if (isGroup) {
            groupMetadata = await conn.groupMetadata(from);
            participants = groupMetadata.participants;
            // Verificamos si el senderNumber (limpio) coincide con algún admin (también limpio)
            isAdmin = participants.filter(v => v.admin !== null).map(v => v.id.replace(/[^0-9]/g, '')).includes(senderNumber);
        }

        // --- VALIDACIONES DE ACCESO ---
        
        // 1. Validación de Owner: Solo si el archivo del comando tiene isOwner: true
        if (cmd.isOwner && !isOwner) {
            return await conn.sendMessage(from, { text: '⚠️ *Acceso Denegado:* Este comando es exclusivo de mi desarrollador.' }, { quoted: m });
        }
        
        // 2. Validación de Grupo
        if (cmd.isGroup && !isGroup) return;
        
        // 3. Validación de Admin en Grupos
        if (cmd.isAdmin && !isAdmin && isGroup) {
            return await conn.sendMessage(from, { text: '❌ *Solo los Administradores pueden usar este comando.*' }, { quoted: m });
        }

        // --- EJECUCIÓN ---
        await cmd.run(conn, m, {
            args,
            prefix,
            command: commandText,
            isOwner,
            isAdmin,
            isGroup,
            senderNumber, // Pasamos el número limpio por si el comando lo usa
            participants,
            groupMetadata
        });

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL-HANDLER]:'), err);
    }
};