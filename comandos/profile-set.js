import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbDir = './config/database/profile';
const dbPath = path.resolve(dbDir, 'profiles.json');

const profileSettings = {
    name: 'profile-set',
    alias: ['setbirth', 'delbirth', 'setgenre', 'delgenre', 'setpjfavorite', 'setage', 'delage'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

            const user = m.sender.split('@')[0].split(':')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = {};

            const cmd = m.body.split(' ')[0].toLowerCase().replace('#', '');

            if (cmd === 'setage') {
                const age = parseInt(args[0]);
                if (!args[0] || isNaN(age)) {
                    return m.reply(`*${config.visuals.emoji2}* ¡Ey! Tienes que poner tu edad en números.\n\n> Ejemplo: *#setage 20*`);
                }
                if (age < 8 || age > 85) {
                    return m.reply(`*${config.visuals.emoji2}* Solo se permite una edad entre *8 y 85 años*.`);
                }
                db[user].age = age;
                m.reply(`*${config.visuals.emoji3}* Edad guardada: *${age} años*`);
            } 

            else if (cmd === 'setgenre') {
                const genre = args[0]?.toLowerCase();
                if (!genre || (genre !== 'hombre' && genre !== 'mujer')) {
                    return m.reply(`*${config.visuals.emoji2}* Especifica tu género.\n\n> Uso: *#setgenre hombre* o *#setgenre mujer*`);
                }
                db[user].genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                m.reply(`*${config.visuals.emoji3}* Género establecido: *${db[user].genre}*`);
            } 

            else if (cmd === 'setbirth') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Indica tu cumple. Ejemplo: *#setbirth 15/05*`);
                db[user].birth = args[0];
                m.reply(`*${config.visuals.emoji3}* Cumpleaños guardado: *${args[0]}*`);
            }

            else if (cmd === 'setpjfavorite') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* ¿Cuál es el nombre del personaje?`);
                db[user].favPj = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* Personaje favorito: *${db[user].favPj}*`);
            }

            else if (cmd.startsWith('del')) {
                const key = cmd.replace('del', '').replace('pjfavorite', 'favPj');
                if (db[user] && db[user][key]) {
                    delete db[user][key];
                    m.reply(`*${config.visuals.emoji3}* Dato borrado.`);
                } else {
                    m.reply(`*${config.visuals.emoji2}* No tienes ese dato guardado.`);
                }
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error crítico. Asegúrate de que el archivo profiles.json tenga solo un \`{}\` adentro.`);
        }
    }
};

export default profileSettings;
