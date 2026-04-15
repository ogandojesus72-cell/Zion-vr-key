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
        // 1. MEJORA EN LA DETECCIÓN DE MEDIA
        const quoted = m.quoted ? m.quoted : m;
        
        // Intentamos obtener el mimetype de varias formas posibles en la estructura del bot
        const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';

        if (!/image|video/.test(mime)) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nResponde a una imagen o video corto para convertirlo en enlace.\n\n> Ejemplo: Envía una imagen y pon *${usedPrefix}${commandName}*`);
        }

        try {
            // 2. PRIMER AVISO (Procesando)
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            // Descargar el archivo de WhatsApp
            const media = await quoted.download();

            // Preparar el envío a TU servidor
            const formData = new FormData();
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1]}`,
                contentType: mime 
            });

            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            const data = await res.json();

            // 3. VERIFICAR RESPUESTA DE TU API
            if (!res.ok || (!data.fileUrl && !data.url)) {
                return m.reply('*❁* `Error en Servidor` *❁*\n\nTu API de Yotsuba no devolvió un enlace válido. Revisa los logs de PM2.');
            }

            const finalUrl = data.fileUrl || data.url;

            // 4. AVISO FINAL (Estética Félix tal cual la pediste)
            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { 
                text: successText 
            }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply('*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API. Asegúrate de que el puerto 3000 esté online.');
        }
    }
};

export default yotsubaUploadCommand;