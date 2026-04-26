import fetch from 'node-fetch';
import yts from 'yt-search';
import { config } from '../config.js';

const youtubeCommand = {
    name: 'play',
    alias: ['play2', 'audio', 'video', 'ytmp3', 'ytmp4'],
    category: 'download',
    noPrefix: true, // Agregado como pediste

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* \`Falta Texto\`\n\nIngresa un nombre o enlace.`);

        try {
            const yt_search = await yts(text);
            const video = yt_search.videos[0];
            if (!video) return m.reply(`*${config.visuals.emoji2}* No encontré nada.`);

            const isVideo = ['play2', 'video', 'ytmp4'].includes(commandName);
            
            const infoBot = `┏━━━━✿︎ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ✿︎━━━━╮
┃ ✐ *Título:* \`${video.title}\`
┃ ✐ *Canal:* \`${video.author.name}\`
┃ ✐ *Estado:* \`Enviando archivo...\`
╰━━━━━━━━━━━━━━━━━━━╯`;

            await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: infoBot }, { quoted: m });

            // APIs más estables para evitar el error de "no se puede cargar"
            const apis = [
                `https://api.siputzx.my.id/api/d/yt${isVideo ? 'mp4' : 'mp3'}?url=${video.url}`,
                `https://api.zenkey.my.id/api/download/yt${isVideo ? 'mp4' : 'mp3'}?apikey=zenkey&url=${video.url}`,
                `https://api.agatz.xyz/api/yt${isVideo ? 'mp4' : 'mp3'}?url=${video.url}`
            ];

            let success = false;
            for (const api of apis) {
                try {
                    const res = await fetch(api);
                    const data = await res.json();
                    let dlUrl = data.dl || data.result?.download?.url || data.data?.downloadUrl;

                    if (dlUrl) {
                        await conn.sendMessage(m.chat, { 
                            [isVideo ? 'video' : 'audio']: { url: dlUrl }, 
                            mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
                            fileName: `${video.title}.${isVideo ? 'mp4' : 'mp3'}`,
                            caption: isVideo ? `> ${config.botName}` : null
                        }, { quoted: m });
                        success = true;
                        break;
                    }
                } catch (e) { continue; }
            }

            if (!success) m.reply(`*${config.visuals.emoji2}* \`Error Crítico\`\n\nEl servidor de descarga falló. Intenta de nuevo en un momento.`);

        } catch (error) {
            console.error(error);
            m.reply(`*${config.visuals.emoji2}* Ocurrió un error inesperado.`);
        }
    }
};

export default youtubeCommand;
