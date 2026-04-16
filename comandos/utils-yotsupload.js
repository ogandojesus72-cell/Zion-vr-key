/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        // 1. DETECCIÓN DE MEDIA (Lógica original de Kazuma)
        const quoted = m.quoted ? m.quoted : m;
        // Si no hay mimetype, intentamos buscarlo en el mensaje base
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!mime || !/image|video|webp/.test(mime)) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nResponde a una imagen o video corto para convertirlo en enlace.\n\n> Ejemplo: Envía una imagen y pon *${usedPrefix}${commandName}*`);
        }

        try {
            // 2. PRIMER AVISO (Estética Kazuma)
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            // 3. DESCARGA DEL MEDIA
            const media = await quoted.download();
            if (!media) return m.reply('*❁* `Error de Medios` *❁*\n\nNo se pudo procesar el archivo de WhatsApp.');

            // 4. PREPARACIÓN PARA TU API
            const formData = new FormData();
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
                contentType: mime 
            });

            // Solicitud a tu servidor
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

            // 5. MENSAJE FINAL (Tal cual lo pediste)
            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply(`*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API.`);
        }
    }
};

export default yotsubaUploadCommand;