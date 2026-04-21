import fetch from 'node-fetch';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta', 'playdoc'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Texto o Enlace\` *❁*\n\nIngresa un nombre o un enlace de YouTube.`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);

        if (!isUrl) {
            try {
                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const resSearch = await fetch(searchUrl);
                const dataSearch = await resSearch.json();
                if (!dataSearch.status || !dataSearch.result || dataSearch.result.length === 0) return m.reply('*❁* `Sin Resultados` *❁*');
                text = dataSearch.result[0].link;
            } catch (err) {
                return m.reply('*❁* `Error de Búsqueda` *❁*');
            }
        }

        await m.reply(`*✿︎* \`Enviando...\` *✿︎*\n\n> ⏳ Procesando su solicitud, espere un momento...`);

        const isVideo = ['playvideo', 'ytv', 'playdoc'].includes(commandName);
        const isDoc = commandName === 'playdoc';
        const type = isVideo ? 'Video' : 'Audio';
        const apiUrl = `https://nex-magical.vercel.app/download/${type.toLowerCase()}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            const res = await fetch(apiUrl);
            const data = await res.json();
            if (!data.status || !data.result.url) return m.reply('*❁* `Error de Descarga` *❁*');

            const downloadUrl = data.result.url;
            const thumb = data.result.info.thumbnail;
            const title = data.result.info.title || 'YouTube Content';

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*\n> ꕥ Contenido obtenido con éxito.\n\n*✿︎ Título:* \`${title}\`\n*✿︎ Calidad:* \`${data.result.quality}\`\n\n> Enviando archivo...`;

            await conn.sendMessage(m.key.remoteJid, { image: { url: thumb }, caption: infoText }, { quoted: m });

            if (isDoc) {
                await conn.sendMessage(m.key.remoteJid, { 
                    document: { url: downloadUrl }, 
                    mimetype: 'video/mp4',
                    fileName: `${title}.mp4`,
                    caption: `> Descargado por Kazuma Mister Bot`
                }, { quoted: m });
            } else if (isVideo) {
                await conn.sendMessage(m.key.remoteJid, { 
                    video: { url: downloadUrl }, 
                    caption: `*✿︎ Video:* \`${data.result.videoId}\`\n> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4',
                    fileName: `${title}.mp4`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.key.remoteJid, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            m.reply('*❁* `Error Crítico` *❁*');
        }
    }
};

export default youtubeCommand;
