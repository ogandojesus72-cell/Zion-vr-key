import { config } from '../config.js';

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    admin: true, 
    botAdmin: true, 
    noPrefix: true,

    run: async (conn, m, { args, text, participants, isGroup }) => {
        if (!isGroup) return;

        let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;

        if (!victim) return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\` *${config.visuals.emoji2}*\n\nDebes etiquetar a alguien o responder a su mensaje para eliminarlo.`);

        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = config.owner.includes(victim);
        const isAdmin = participants.find(p => p.id === victim)?.admin;

        if (victim === botId) {
            return m.reply(`*${config.visuals.emoji3}* No puedo eliminarme a mí mismo.`);
        }

        if (isOwner) {
            return m.reply(`*${config.visuals.emoji11}* Error de jerarquía: No tengo permitido eliminar a mi **Owner**.`);
        }

        if (isAdmin) {
            return m.reply(`*${config.visuals.emoji6}* No puedo eliminar a @${victim.split('@')[0]} porque es un **Administrador**.`, null, { mentions: [victim] });
        }

        try {
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji7} \`SISTEMA DE MODERACIÓN\` ${config.visuals.emoji7}*\n\nEl usuario @${victim.split('@')[0]} será eliminado del grupo por orden administrativa.`,
                mentions: [victim]
            }, { quoted: m });

            await new Promise(resolve => setTimeout(resolve, 1000));

            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Hubo un fallo al intentar eliminar al usuario.`);
        }
    }
};

export default kickCommand;