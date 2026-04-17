/* KAZUMA MISTER BOT - MODERATION SYSTEM 
   Desarrollado por Félix OFC
*/

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    isAdmin: true, 
    botAdmin: true, 
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        // Obtenemos metadatos para verificar admins y owner del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        // Verificamos si hay alguien a quien eliminar
        if (!m.mentionedJid[0] && !m.quoted) {
            return m.reply(`*❁* \`Uso Incorrecto\` *❁*\n\nDebes etiquetar a alguien o responder a su mensaje.`);
        }

        let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
        
        // Identidades especiales
        const botId = conn.decodeJid(conn.user.id);
        const ownerGroup = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
        
        // Buscamos al participante en el grupo
        const participant = participants.find((p) => p.id === victim);

        if (!participant) {
            return m.reply(`*❁* \`Error\` *❁*\n\nEl usuario no se encuentra en este grupo.`);
        }

        // --- VALIDACIONES DE SEGURIDAD ---

        if (victim === botId) {
            return m.reply(`*✿︎* No puedo eliminarme a mí mismo.`);
        }

        if (victim === ownerGroup) {
            return m.reply(`*✿︎* No puedo eliminar al dueño del grupo.`);
        }

        // Verificamos si la víctima es Admin
        if (participant.admin || participant.isSuperAdmin) {
            return m.reply(`*❁* \`Acción Denegada\` *❁*\n\nNo puedo eliminar a *@${victim.split('@')[0]}* porque es un Administrador.`, null, { mentions: [victim] });
        }

        // --- EJECUCIÓN ---
        try {
            await conn.sendMessage(m.chat, { 
                text: `*✿︎* \`SISTEMA DE MODERACIÓN\` *✿︎*\n\nEl usuario *@${victim.split('@')[0]}* será eliminado por orden administrativa.`,
                mentions: [victim]
            }, { quoted: m });
            
            // Delay para que se vea el mensaje
            await new Promise(resolve => setTimeout(resolve, 1000));

            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');
        } catch (e) {
            return m.reply(`*❁* \`Fallo\` *❁*\n\nNo se pudo completar la expulsión.`);
        }
    }
};

export default kickCommand;