/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

const ytVideoCommand = {
    name: 'ytmp4',
    alias: ['play', 'ytvideo', 'video', 'v'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const apiKey = "api-Bb1JX"; 

        if (!text) {
            return await conn.sendMessage(from, { 
                text: `*${e1} Ingresa un enlace de Youtube.*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - AVISO',
                        body: 'Falta el enlace de video',
                        thumbnailUrl: config.visuals.img1, 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }

        try {
            // 1. AVISO: BUSCANDO
            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2} Buscando resultados...*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - STATUS',
                        body: 'Procesando solicitud...',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

            const apiUrl = `https://api.stellarwa.xyz/dl/ytmp4v2?url=${encodeURIComponent(text)}&key=${apiKey}`;
            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.status || !json.data || !json.data.dl) {
                return m.reply(`*${e1} Error:* No se pudo obtener el enlace de descarga.`);
            }

            const { title, uploader, views, size, duration, dl, thumb } = json.data;

            // --- TRUCO PARA QUE PAREZCA ENVIADO POR USUARIO ---
            // Descargamos la miniatura para que WhatsApp la use de previsualización
            const thumbBuffer = await fetch(thumb).then(res => res.buffer());

            // 2. ENVÍO DEL VIDEO REAL CON THUMBNAIL
            await conn.sendMessage(from, { 
                video: { url: dl }, // Usamos la URL para que Baileys gestione el streaming
                caption: `*${e1} TÍTULO:* ${title}\n*👤 CANAL:* ${uploader}\n*👁️ VISTAS:* ${views}\n*⌛ DURACIÓN:* ${duration}\n*📦 PESO:* ${size}\n\n> Kazuma-Bot | Félix Ofc`,
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                thumbnail: thumbBuffer, // Esto genera la imagen de previsualización
                seconds: 60 // Valor aproximado para forzar que WhatsApp lo trate como video corto/real
            }, { quoted: m });

        } catch (error) {
            console.error('Error en descargas-ytvideo:', error);
            m.reply(`*${e1} Error:* Hubo un fallo al procesar el archivo de video.`);
        }
    }
};

export default ytVideoCommand;
