import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');

const genreSystem = {
    name: 'profile-setgenre',
    alias: ['setgenre', 'delgenre', 'genero', 'borrargenero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const cmd = m.body.toLowerCase();
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));

            if (cmd.includes('delgenre') || cmd.includes('borrargenero')) {
                if (!genres[user]) return m.reply(`*${config.visuals.emoji2}* No posees un género establecido.`);
                delete genres[user];
                fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));
                return m.reply(`*${config.visuals.emoji3}* \`GÉNERO ELIMINADO\` 🗑️`);
            }

            if (genres[user]) return m.reply(`*${config.visuals.emoji2}* Identidad fijada: *${genres[user]}*. Usa #delgenre para resetear.`);
            
            const genre = args[0]?.toLowerCase();
            if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2}* Formato: #setgenre hombre/mujer`);

            const nuevoGenero = genre === 'hombre' ? 'Hombre' : 'Mujer';
            genres[user] = nuevoGenero;
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));

            if (casados[user]) {
                const pareja = casados[user];
                const generoPareja = genres[pareja];
                if (generoPareja === nuevoGenero) {
                    delete casados[user];
                    delete casados[pareja];
                    fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                    const aviso = `*♰ DIVORCIO AUTOMÁTICO ♰*\n\nSimetría de géneros detectada. El vínculo ha sido anulado.`;
                    await conn.sendMessage(m.sender, { text: aviso });
                    await conn.sendMessage(pareja + '@s.whatsapp.net', { text: aviso });
                    return m.reply(`*${config.visuals.emoji3}* Género fijado. Se ha disuelto el vínculo con @${pareja} por incompatibilidad.`);
                }
            }
            m.reply(`*${config.visuals.emoji3}* \`GÉNERO ESTABLECIDO:\` *${nuevoGenero}* ✦`);
        } catch (e) {
            m.reply('✘ Error en la matriz de identidad.');
        }
    }
};

export default genreSystem;