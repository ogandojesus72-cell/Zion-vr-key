import { config } from '../config.js';
import { avisos } from '../config/avisos.js';

const openGroup = {
    name: 'open',
    alias: ['abrirgroup', 'abrir'],
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(avisos.noBotAdmin);
            }

            if (!groupMetadata.announce) {
                return m.reply(`*${config.visuals.emoji2}* El grupo ya se encuentra abierto.\n\n> ¡No es necesario ejecutar la apertura de nuevo!`);
            }

            await conn.groupSettingUpdate(m.chat, 'not_announcement');
            
            m.reply(`*${config.visuals.emoji3} \`GRUPO ABIERTO\` ${config.visuals.emoji3}*\n\nLa restricción ha sido levantada.\n\n> ¡Mantengan el orden y respeten las reglas!`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar abrir el grupo.`);
        }
    }
};

export default openGroup;