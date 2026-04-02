/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

let ytSearchDB = {};

const ytCommand = {
    name: 'yt',
    alias: ['ytmp4', 'play', 'ytsearch', 'download'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const apiKey = config.apiYT;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;

        // --- 1. FUNCIÓN DE DESCARGA (play / ytmp4) ---
        if (command === 'ytmp4' || command === 'play') {
            if (!text) {
                return await conn.sendMessage(from, { 
                    text: `*${e1} Ingresa un enlace de Youtube.*`,
                    contextInfo: {
                        externalAdReply: {
                            title: config.botName,
                            body: 'Youtube Downloader',
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
                // AQUÍ SE HACE LA SOLICITUD A LA API DE DESCARGAS
                const apiUrl = `https://nex-magical.vercel.app/download/video?url=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const res = await fetch(apiUrl);
                const json = await res.json();

                if (!json.status || !json.result.url) {
                    return m.reply(`*${e1} Error:* La API no devolvió un enlace válido.`);
                }

                const { title, duration, size } = json.result.info;
                const videoUrl = json.result.url;

                // Enviamos el video con la info del JSON
                await conn.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `*${e1} TÍTULO:* ${title || 'Video'}\n*⌛ DURACIÓN:* ${duration || '---'}\n*📦 PESO:* ${size || '---'}\n\n> Kazuma-Bot | Félix Ofc`,
                    fileName: `${title || 'video'}.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m });

            } catch (error) {
                console.error(error);
                m.reply(`*${e1} Error:* No se pudo conectar con la API de descargas.`);
            }
        }

        // --- 2. FUNCIÓN DE BÚSQUEDA (yt / ytsearch) ---
        if (command === 'yt' || command === 'ytsearch') {
            if (!text) {
                return await conn.sendMessage(from, { 
                    text: `*${e2} Ingresa el nombre del video a buscar.*`,
                    contextInfo: {
                        externalAdReply: {
                            title: config.botName,
                            body: 'Youtube Search',
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
                // SOLICITUD A LA API DE BÚSQUEDA
                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const res = await fetch(searchUrl);
                const json = await res.json();

                if (!json.status || !json.result.length) {
                    return m.reply(`*${e1} Error:* No encontré nada para "${text}".`);
                }

                // Guardamos los links para que el 'before' los use
                ytSearchDB[from] = json.result.map(v => v.link);

                let txt = `*${e2} RESULTADOS DE:* ${text.toUpperCase()}\n${config.visuals.line.repeat(20)}\n\n`;
                json.result.slice(0, 10).forEach((v, i) => {
                    txt += `*#${i + 1}* - ${v.title}\n*⌛:* ${v.duration}\n\n`;
                });
                txt += `${config.visuals.line.repeat(20)}\n*${e1} Responde con el número para descargar.*`;

                await conn.sendMessage(from, { 
                    image: { url: config.visuals.img2 }, 
                    caption: txt,
                    contextInfo: {
                        externalAdReply: {
                            title: 'YOUTUBE SEARCH',
                            body: `Kazuma Search System`,
                            thumbnailUrl: config.visuals.img1,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });

            } catch (error) {
                console.error(error);
                m.reply(`*${e1} Error:* Fallo en el sistema de búsqueda.`);
            }
        }
    }
};

// ESTO DETECTA CUANDO RESPONDEN CON UN NÚMERO
export const before = async (conn, m) => {
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('RESULTADOS DE:')) return;

    const from = m.key.remoteJid;
    const chatData = ytSearchDB[from];
    if (!chatData) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= chatData.length) return;

    const link = chatData[index];
    
    // Llamamos de nuevo al run para que haga la descarga del link seleccionado
    await ytCommand.run(conn, m, { text: link, command: 'ytmp4' });
};

export default ytCommand;
