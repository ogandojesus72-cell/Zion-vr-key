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
        // 1. VERIFICAR SI HAY MEDIA (Imagen o Video corto)
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        
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
            // Usamos 'file' porque es el campo común en Fastify/Multipart
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
            // Ajusta 'data.fileUrl' según el JSON exacto que devuelva tu server.js
            if (!res.ok || (!data.fileUrl && !data.url)) {
                return m.reply('*❁* `Error en Servidor` *❁*\n\nTu API de Yotsuba no devolvió un enlace válido. Revisa los logs de PM2.');
            }

            const finalUrl = data.fileUrl || data.url;

            // 4. AVISO FINAL (Éxito con estética de Félix)
            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`
*✿︎ Hosting:* \`Privado (Felix Server)\`

> ¡(Aviso)! Recuerda que este enlace es público, compártelo con cuidado.`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: successText 
            }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply('*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API. Asegúrate de que el puerto 3000 esté online.');
        }
    }
};

export default yotsubaUploadCommand;