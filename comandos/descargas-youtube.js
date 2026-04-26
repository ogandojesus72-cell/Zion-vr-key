import axios from 'axios';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta', 'playdoc'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*❁* \`Falta Texto o Enlace\` *❁*\n\nIngresa un nombre o un enlace de YouTube.`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);

        let finalUrl = text;
        if (!isUrl) {
            try {
                const searchRes = await axios.get(`https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`);
                if (!searchRes.data.status || !searchRes.data.result.length) return m.reply('*❁* `Sin Resultados` *❁*');
                finalUrl = searchRes.data.result[0].link;
            } catch (err) {
                return m.reply('*❁* `Error de Búsqueda` *❁*');
            }
        }

        await m.reply(`*✿︎* \`Enviando...\` *✿︎*\n\n> ⏳ Procesando su solicitud, espere un momento...`);

        const isVideo = ['playvideo', 'ytv', 'playdoc'].includes(commandName);
        const isDoc = commandName === 'playdoc';
        const type = isVideo ? 'video' : 'audio';

        try {
            const downloadRes = await axios.get(`https://nex-magical.vercel.app/download/${type}?url=${encodeURIComponent(finalUrl)}&apikey=${apiKey}`);
            if (!downloadRes.data.status || !downloadRes.data.result.url) return m.reply('*❁* `Error de Descarga` *❁*');

            const { url: dlUrl, info, quality } = downloadRes.data.result;
            const title = info.title || 'YouTube Content';

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*\n> ꕥ Contenido obtenido con éxito.\n\n*✿︎ Título:* \`${title}\`\n*✿︎ Calidad:* \`${quality || '128'}\`\n\n> Enviando archivo...`;

            await conn.sendMessage(m.chat, { image: { url: info.thumbnail }, caption: infoText }, { quoted: m });

            // DESCARGA DEL BUFFER REAL
            const fileBuffer = await axios.get(dlUrl, { responseType: 'arraybuffer' });
            const finalBuffer = Buffer.from(fileBuffer.data);

            if (isDoc) {
                await conn.sendMessage(m.chat, { 
                    document: finalBuffer, 
                    mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
                    fileName: `${title}.${isVideo ? 'mp4' : 'mp3'}`,
                    caption: `> Descargado por Kazuma Mister Bot`
                }, { quoted: m });
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { 
                    video: finalBuffer, 
                    mimetype: 'video/mp4',
                    fileName: `${title}.mp4`,
                    caption: `> Descargado por Kazuma Mister Bot`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { 
                    audio: finalBuffer, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            console.error(err);
            m.reply('*❁* `Error Crítico` *❁*\n\n> El archivo es demasiado pesado o el servidor falló.');
        }
    }
};

export default youtubeCommand;