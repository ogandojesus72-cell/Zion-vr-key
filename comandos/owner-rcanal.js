import { config } from '../config.js';

const followCanalCommand = {
    name: 'rcanal',
    alias: ['seguir'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        // Si no hay texto, cortamos para evitar errores
        if (!text) return;

        try {
            // Extraer el código del canal del link de forma ultra simple
            const parts = text.split('/');
            const code = parts[parts.length - 1].trim();

            if (!code) return;

            // Intentar seguir usando la función interna de Baileys
            // Si tu socket no tiene 'newsletterFollow', saltará al catch
            if (conn.newsletterFollow) {
                await conn.newsletterFollow(code);
                return m.reply(`✅ Siguiendo canal: ${code}`);
            }

            // Si no existe esa función, enviamos el paquete binario (IQ) manualmente
            await conn.query({
                tag: 'iq',
                attrs: { 
                    to: '@s.whatsapp.net', 
                    type: 'set', 
                    xmlns: 'w:mex' 
                },
                content: [{
                    tag: 'query',
                    attrs: { query_id: '6620195908089573' },
                    content: JSON.stringify({ 
                        variables: { 
                            newsletter_id: code 
                        } 
                    })
                }]
            });

            await m.reply(`✅ Solicitud de seguimiento enviada.`);

        } catch (err) {
            // Aquí capturamos cualquier error para que el bot al menos responda algo
            await m.reply(`❌ Fallo interno: ${err.message}`);
        }
    }
};

export default followCanalCommand;
