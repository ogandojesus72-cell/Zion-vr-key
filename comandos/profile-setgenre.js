import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');

const genreSystem = {
    name: 'setgenre',
    alias: ['delgenre', 'genero', 'borrargenero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const text = m.body.toLowerCase();
            
            if (!fs.existsSync(genrePath)) fs.writeFileSync(genrePath, JSON.stringify({}));
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));

            if (text.includes('delgenre') || text.includes('borrargenero')) {
                if (!genres[user]) return m.reply(`*${config.visuals.emoji2}* Sin identidad registrada.`);
                delete genres[user];
                fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));
                return m.reply(`*${config.visuals.emoji3}* \`GÉNERO ELIMINADO\` 🗑️`);
            }

            if (genres[user]) return m.reply(`*${config.visuals.emoji2}* Identidad: *${genres[user]}*. Usa #delgenre para resetear.`);
            
            const genre = args[0]?.toLowerCase();
            if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2}* #setgenre hombre/mujer`);

            const nuevoGenero = genre === 'hombre' ? 'Hombre' : 'Mujer';
            genres[user] = nuevoGenero;
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));

            if (fs.existsSync(marryPath)) {
                let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));
                if (casados[user]) {
                    const pareja = casados[user];
                    if (genres[pareja] === nuevoGenero) {
                        delete casados[user];
                        delete casados[pareja];
                        fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                        const aviso = `*♰ DIVORCIO AUTOMÁTICO ♰*\n\nSimetría de géneros detectada. El vínculo ha sido anulado.`;
                        await conn.sendMessage(m.sender, { text: aviso });
                        await conn.sendMessage(pareja + '@s.whatsapp.net', { text: aviso });
                    }
                }
            }

            m.reply(`*${config.visuals.emoji3}* \`GÉNERO ESTABLECIDO:\` *${nuevoGenero}* ✦`);
        } catch (e) {
            m.reply('✘ Error en la matriz de identidad.');
        }
    }
};

export default genreSystem;
