import fetch from 'node-fetch';
import yts from 'yt-search';
import { config } from '../config.js';

const youtubeCommand = {
    name: 'play',
    alias: ['play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica', 'ytv', 'yta', 'ytmp3', 'ytmp4'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* \`Falta Texto o Enlace\`\n\nIngresa un nombre o enlace.`);

        try {
            const yt_search = await yts(text);
            const video = yt_search.videos[0];
            if (!video) return m.reply(`*${config.visuals.emoji2}* \`Sin Resultados\``);

            const isVideo = ['play2', 'video', 'playdoc2', 'ytv', 'ytmp4'].includes(commandName);
            const isDoc = ['play3', 'play4', 'playdoc', 'playdoc2', 'ytmp3doc', 'ytmp4doc'].includes(commandName);
            const type = isVideo ? 'video' : 'audio';

            const infoBot = `┏━━━━✿︎ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ✿︎━━━━╮
┃ ✐ *Título:* \`${video.title}\`
┃ ✐ *Duración:* \`${video.timestamp}\`
┃ ✐ *Estado:* \`Enviando ${type}...\`
╰━━━━━━━━━━━━━━━━━━━╯`;

            await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: infoBot }, { quoted: m });

            // LISTA DE APIS (Lógica del bot viejo)
            const apis = [
                `https://api.siputzx.my.id/api/d/yt${isVideo ? 'mp4' : 'mp3'}?url=${video.url}`,
                `https://api.zenkey.my.id/api/download/yt${isVideo ? 'mp4' : 'mp3'}?apikey=zenkey&url=${video.url}`,
                `https://api.agatz.xyz/api/yt${isVideo ? 'mp4' : 'mp3'}?url=${video.url}`,
                `https://api.dorratz.com/v3/ytdl?url=${video.url}`
            ];

            let success = false;

            for (const api of apis) {
                try {
                    const res = await fetch(api);
                    const data = await res.json();
                    
                    // Extraemos la URL de descarga según el formato de cada API
                    let dlUrl = data.dl || data.result?.download?.url || data.data?.downloadUrl || data.medias?.find(v => v.extension === (isVideo ? 'mp4' : 'mp3'))?.url;

                    if (dlUrl) {
                        const sendType = isDoc ? 'document' : (isVideo ? 'video' : 'audio');
                        const mimeType = isVideo ? 'video/mp4' : 'audio/mpeg';
                        const fileName = `${video.title}.${isVideo ? 'mp4' : 'mp3'}`;

                        const messageContent = {
                            [sendType]: { url: dlUrl },
                            mimetype: mimeType,
                            fileName: fileName,
                            caption: isVideo ? `*✿︎ Video:* \`${video.title}\`\n> Descargado por ${config.botName}` : null
                        };

                        await conn.sendMessage(m.chat, messageContent, { quoted: m });
                        success = true;
                        break; // Si una funciona, salimos del bucle
                    }
                } catch (e) {
                    console.log(`Fallo en API: ${api}`);
                    continue;
                }
            }

            if (!success) throw new Error("Todas las APIs fallaron");

        } catch (error) {
            console.error(error);
            m.reply(`*${config.visuals.emoji2}* \`Error Crítico\`\n\nNo pude procesar la descarga. Intenta con un enlace directo.`);
        }
    }
};

export default youtubeCommand;