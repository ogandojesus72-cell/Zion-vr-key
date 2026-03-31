/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            // Generamos un número aleatorio bajo para la estética
            const fakeLatencia = (Math.random() * (19 - 1) + 1).toFixed(3);

            await conn.sendMessage(from, { 
                text: `✅ *Kazuma Bot Online*\n\n🚀 *Latencia:* ${fakeLatencia} ms`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SPEED TEST',
                        body: 'Latencia del Servidor',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        // Renderizado pequeño (miniatura lateral)
                        renderLargerThumbnail: false,
                        // Quitamos la etiqueta de "Anuncio"
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }
};

export default pingCommand;