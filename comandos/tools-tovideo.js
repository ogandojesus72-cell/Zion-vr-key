import { config } from '../config.js';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const toGifCommand = {
    name: 'togif',
    alias: ['tovideo', 'tomp4'],
    category: 'tools',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            // 1. Obtener el mensaje (si es citado o el actual)
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            // 2. Validar que sea un sticker
            if (!/webp/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* \`Error\`\n\nResponde a un sticker animado para convertirlo.`);
            }

            // 3. Descargar el sticker
            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* Error al descargar.`);

            await m.reply(`*${config.visuals.emoji3}* Procesando conversión...`);

            // 4. Configurar archivos temporales
            const filename = `${Date.now()}`;
            const tempWebp = join(tmpdir(), `${filename}.webp`);
            const tempMp4 = join(tmpdir(), `${filename}.mp4`);

            await writeFile(tempWebp, img);

            /**
             * 5. Ejecutar FFmpeg
             * Explicación de los flags:
             * -pix_fmt yuv420p: Asegura compatibilidad con reproductores de video móviles.
             * -vf "scale...": Ajusta el tamaño para que sea divisible por 2 (requisito de MP4).
             */
            exec(`ffmpeg -i ${tempWebp} -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`, async (err) => {
                if (err) {
                    console.error(err);
                    await unlink(tempWebp).catch(() => {});
                    return m.reply(`*${config.visuals.emoji2}* Hubo un error en la conversión. ¿Es un sticker animado?`);
                }

                const videoBuffer = await readFile(tempMp4);

                // 6. Enviar como video con reproducción automática (modo GIF)
                await conn.sendMessage(m.chat, { 
                    video: videoBuffer, 
                    caption: `*${config.visuals.emoji}* Aquí tienes tu GIF`,
                    gifPlayback: true 
                }, { quoted: m });

                // 7. Limpieza
                await unlink(tempWebp);
                await unlink(tempMp4);
            });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error interno.`);
        }
    }
};

export default toGifCommand;