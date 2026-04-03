/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import fetch from 'node-fetch';
import { config } from '../config.js';

if (!global.ytSearchDB) global.ytSearchDB = {};

const ytSearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'yts', 'buscar'],
    category: 'downloader',
    run: async (conn, m, { text }) => {
        const from = m.chat;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;

        if (!text) return conn.sendMessage(from, { text: `${e1} Ingresa el nombre del video a buscar.` }, { quoted: m });

        try {
            await conn.sendMessage(from, { text: `${e2} Buscando resultados para: ${text}...` }, { quoted: m });

            const res = await fetch(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=api-Bb1JX`);
            const json = await res.json();

            if (!json.status || !json.result || json.result.length === 0) {
                return conn.sendMessage(from, { text: `${e1} No se encontraron resultados.` }, { quoted: m });
            }

            const results = json.result.slice(0, 10);
            global.ytSearchDB[from] = results.map(v => v.url);

            let txt = `${e2} *RESULTADOS DE:* ${text.toUpperCase()}\n\n`;
            results.forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title}\n${e1} Duración: ${v.duration}\n${e1} Canal: ${v.autor}\n\n`;
            });
            txt += `${e2} *Responde con un número para descargar el audio.*`;

            await conn.sendMessage(from, { 
                image: { url: results[0].banner }, 
                caption: txt 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            conn.sendMessage(from, { text: `${e1} Error al conectar con el buscador.` }, { quoted: m });
        }
    }
};

export const before = async (conn, m) => {
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('RESULTADOS DE:')) return;

    const from = m.chat;
    const e1 = config.visuals.emoji;
    const e2 = config.visuals.emoji2;
    const links = global.ytSearchDB[from];
    if (!links) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= links.length) return;

    const selectedLink = links[index];

    try {
        await conn.sendMessage(from, { text: `${e2} Descargando audio (MP3)...` }, { quoted: m });
        
        const res = await fetch(`https://api.stellarwa.xyz/dl/ytdl?url=${encodeURIComponent(selectedLink)}&format=mp3&key=api-Bb1JX`);
        const data = await res.json();

        const dlLink = data.result?.download || data.data?.dl;
        if (!dlLink) return conn.sendMessage(from, { text: `${e1} No se pudo generar el link.` }, { quoted: m });

        const audioBuffer = await fetch(dlLink).then(r => r.buffer());

        await conn.sendMessage(from, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            fileName: `audio.mp3` 
        }, { quoted: m });

    } catch (e) {
        conn.sendMessage(from, { text: `${e1} Error al procesar el audio.` }, { quoted: m });
    }
};

export default ytSearchCommand;
