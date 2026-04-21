import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'ytv', 'play'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Texto\`\n\nIngresa un nombre o enlace.`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);

        if (!isUrl) {
            try {
                await m.reply(`*✿︎* \`Buscando...\`\n> ⏳ Consultando YouTube...`);
                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const resSearch = await fetch(searchUrl);
                const dataSearch = await resSearch.json();
                if (!dataSearch.status || !dataSearch.result.length) return m.reply('*❁* `Sin resultados`');
                text = dataSearch.result[0].link;
            } catch (err) { return m.reply('*❁* `Error de búsqueda`'); }
        }

        const isVideo = ['playvideo', 'ytv', 'play'].includes(commandName);
        const type = isVideo ? 'video' : 'audio';
        const apiUrl = `https://nex-magical.vercel.app/download/${type}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            await m.reply(`*✿︎* \`Descargando\` *✿︎*\n\nObteniendo archivo en el servidor...\n\n> ⏳ Procesando envío directo...`);

            const res = await fetch(apiUrl);
            const data = await res.json();
            if (!data.status || !data.result.url) return m.reply('*❁* `Error en API`');

            const mediaUrl = data.result.url;
            const ext = isVideo ? 'mp4' : 'mp3';
            const fileName = `temp_${Date.now()}.${ext}`;
            const filePath = path.join('./', fileName);

            const writer = fs.createWriteStream(filePath);
            const response = await axios({
                url: mediaUrl,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE DOWNLOAD\` «*\n\n*✿︎ Título:* \`${data.result.info.title}\`\n*✿︎ Calidad:* \`${data.result.quality}\`\n\n> Enviando desde el servidor...`;
            await conn.sendMessage(m.chat, { image: { url: data.result.info.thumbnail }, caption: infoText }, { quoted: m });

            if (isVideo) {
                await conn.sendMessage(m.chat, { 
                    video: fs.readFileSync(filePath), 
                    caption: `> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4',
                    fileName: `${data.result.info.title}.mp4`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { 
                    audio: fs.readFileSync(filePath), 
                    mimetype: 'audio/mpeg',
                    fileName: `${data.result.info.title}.mp3`
                }, { quoted: m });
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        } catch (err) {
            console.error(err);
            m.reply('*❁* `Error Crítico`');
        }
    }
};

export default youtubeCommand;
