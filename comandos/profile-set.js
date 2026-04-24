import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './config/database/profile/profiles.json';

const profileSettings = {
    name: 'profile-set',
    alias: ['setbirth', 'delbirth', 'setgenre', 'delgenre', 'setpjfavorite', 'setage', 'delage'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            // Cargar DB
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            const user = m.sender.split('@')[0];
            if (!db[user]) db[user] = {};

            const text = m.body.toLowerCase();

            if (text.includes('setage')) {
                const age = parseInt(args[0]);
                if (isNaN(age) || age < 8 || age > 85) {
                    return m.reply(`*${config.visuals.emoji2}* Pon una edad válida (8-85).\n> Ejemplo: #setage 20`);
                }
                db[user].age = age;
                m.reply(`*${config.visuals.emoji3}* Edad guardada: *${age}*`);
            } 
            
            else if (text.includes('setgenre')) {
                const genre = args[0]?.toLowerCase();
                if (genre !== 'hombre' && genre !== 'mujer') {
                    return m.reply(`*${config.visuals.emoji2}* Solo se permite: *hombre* o *mujer*.`);
                }
                db[user].genre = genre === 'hombre' ? 'Hombre' : 'Mujer';
                m.reply(`*${config.visuals.emoji3}* Género guardado: *${db[user].genre}*`);
            }

            else if (text.includes('setbirth')) {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Ejemplo: #setbirth 15/05`);
                db[user].birth = args[0];
                m.reply(`*${config.visuals.emoji3}* Cumpleaños guardado.`);
            }

            else if (text.includes('setpjfavorite')) {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Pon el nombre del personaje.`);
                db[user].favPj = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* Favorito guardado.`);
            }

            else if (text.includes('del')) {
                const key = text.includes('age') ? 'age' : text.includes('genre') ? 'genre' : text.includes('birth') ? 'birth' : 'favPj';
                delete db[user][key];
                m.reply(`*${config.visuals.emoji3}* Dato eliminado.`);
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        } catch (e) {
            console.log(e);
            m.reply(`*${config.visuals.emoji2}* Error en el archivo. Borra el JSON y deja que el bot lo cree solo.`);
        }
    }
};

export default profileSettings;