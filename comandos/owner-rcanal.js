import { config } from '../config.js';

const reactCanalCommand = {
    name: 'reactcanal',
    alias: ['rcanal', 'reaccionar'],
    category: 'owner',
    isOwner: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (args.length < 2) return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nEjemplo:\n${usedPrefix + commandName} https://whatsapp.com/channel/XXXXX 🔥`);

        let [link, emoji] = args;

        if (!link.includes('whatsapp.com/channel/')) {
            return m.reply(`*${config.visuals.emoji2}* El enlace proporcionado no parece ser un canal de WhatsApp válido.`);
        }

        try {
            // 1. Obtener el JID del canal a partir del link
            let res = await conn.newsletterMetadata('url', link);
            let jidCanal = res.id;

            // 2. Pedir los mensajes más recientes del canal
            // Buscamos solo el último (limit: 1)
            let messages = await conn.fetchMessagesFromNewsletter(jidCanal, 1);

            if (!messages || messages.length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No se encontraron mensajes en ese canal.`);
            }

            let lastMsg = messages[0];

            // 3. Enviar la reacción
            await conn.sendMessage(jidCanal, {
                react: {
                    text: emoji,
                    key: { 
                        remoteJid: jidCanal, 
                        id: lastMsg.id, 
                        fromMe: false 
                    }
                }
            });

            m.reply(`*${config.visuals.emoji}* Reacción \`${emoji}\` enviada con éxito al último mensaje del canal.`);

        } catch (err) {
            console.error(err);
            m.reply(`*${config.visuals.emoji2}* \`Error\`\n\nNo pude reaccionar. Asegúrate de que el bot siga el canal o que el canal permita reacciones.`);
        }
    }
};

export default reactCanalCommand;