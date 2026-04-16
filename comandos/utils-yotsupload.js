/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        // 1. Agarrar el mensaje target (quoted o el propio)
        const target = m.quoted || m;
        const msg = target.message || {};

        // Desempaquetar solo para detectar tipo y mime
        const unwrapped = msg.documentWithCaptionMessage?.message || msg;
        const type = Object.keys(unwrapped)[0];
        const mediaData = unwrapped[type] || {};
        const mime = mediaData.mimetype || '';

        if (!MEDIA_TYPES.includes(type) || !mime) {
            return m.reply(
                `*❁* \`Falta Archivo\` *❁*\n\n` +
                `Responde a una imagen o video corto para convertirlo en enlace.\n\n` +
                `> Ejemplo: Responde una imagen con *${usedPrefix}${commandName}*`
            );
        }

        try {
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            // 2. Descargar pasando el target completo (no el desempaquetado)
            const media = await downloadMediaMessage(
                target,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            );

            if (!media) return m.reply('*❁* `Error de Medios` *❁*\n\nNo se pudo descargar el archivo. Intenta de nuevo.');

            // 3. Subir a tu servidor
            const formData = new FormData();
            formData.append('file', media, {
                filename: `kazuma_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
                contentType: mime
            });

            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            const data = await res.json();
            const finalUrl = data.fileUrl || data.url;

            if (!finalUrl) {
                return m.reply('*❁* `Error de API` *❁*\n\nTu servidor no devolvió un enlace válido.');
            }

            // 4. Mensaje final
            const successText =
                `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*\n` +
                `> ꕥ Archivo convertido con éxito.\n\n` +
                `*✿︎ Enlace:* \`${finalUrl}\`\n` +
                `*✿︎ Tipo:* \`${mime}\`\n\n` +
                `> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply(`*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API.\n\`${err.message}\``);
        }
    }
};

export default yotsubaUploadCommand;