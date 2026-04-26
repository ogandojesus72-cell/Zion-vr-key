import { config } from '../config.js';

const followCanalCommand = {
    name: 'rcanal',
    alias: ['seguir'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/);
        if (!linkMatch) return;

        const link = linkMatch[0];

        try {
            // Intentamos obtener el ID necesario para la acción de seguir
            const res = await conn.newsletterMetadata('url', link);
            
            // Acción directa de seguir
            await conn.newsletterFollow(res.id);

            await m.reply(`✅ Canal seguido.`);

        } catch (err) {
            // Si falla por el error de GraphQL, intentamos forzarlo con una petición directa al servidor
            try {
                const code = link.split('/').pop();
                await conn.query({
                    tag: 'iq',
                    attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:mex' },
                    content: [{
                        tag: 'query',
                        attrs: { query_id: '6620195908089573' },
                        content: JSON.stringify({ variables: { newsletter_id: code } })
                    }]
                });
                await m.reply(`✅ Canal seguido.`);
            } catch (e) {
                await m.reply(`❌ No se pudo seguir.`);
            }
        }
    }
};

export default followCanalCommand;