import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');

const setGenre = {
    name: 'setgenre',
    alias: ['genero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const genre = args[0]?.toLowerCase();

            if (!fs.existsSync(genrePath)) fs.writeFileSync(genrePath, JSON.stringify({}));
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));

            if (genres[user]) return m.reply(`*${config.visuals.emoji2}* Identidad fijada: *${genres[user]}*. Usa #delgenre para resetear.`);
            if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2}* Formato: #setgenre hombre/mujer`);

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

export default setGenre;
