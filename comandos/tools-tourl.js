import { config } from '../config.js';
import { uploadToYotsuba } from '../config/UploadFile.js';

const tourlCommand = {
    name: 'tourl',
    alias: ['url', 'imglink', 'subir'],
    category: 'tools',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        const from = m.key.remoteJid;

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';

        if (!mime || !/image|sticker/.test(mime)) {
            return m.reply(`*❁* \`Aviso de detección\` *❁*\n\nResponde a una imagen con el comando *${usedPrefix}tourl* para poder generar tu enlace.`);
        }

        try {
            await m.reply('*✿︎* \`Procesando Multimedia...\` *✿︎*\n\n> Generando enlace en Yotsuba Cloud.');

            const media = await q.download();
            if (!media) throw new Error('No se pudo descargar el medio.');

            const link = await uploadToYotsuba(media, mime);
            const tipo = mime.split("/")[1].toUpperCase();

            const textoExito = `*✿︎* \`Carga Exitosa\` *✿︎*\n\n*🚀 Enlace:* upload.yotsuba.giize.com${link}\n*📂 Tipo:* ${tipo}\n\n> Enlace generado para tu archivo multimedia.`;

            await conn.sendMessage(from, { 
                text: textoExito,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - TOURL',
                        body: `Archivo ${tipo} subido con éxito`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: `https://upload.yotsuba.giize.com${link}`,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            m.reply('*❁* \`Error en Servidor\` *❁*\n\nNo se pudo procesar la subida.');
        }
    }
};

export default tourlCommand;