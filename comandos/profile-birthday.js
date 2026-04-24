import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const birthdaySystem = {
    name: 'setbirth',
    alias: ['delbirth', 'cumpleaños', 'borrarcumple'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const cmd = m.body.toLowerCase();
            
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (cmd.includes('delbirth') || cmd.includes('borrarcumple')) {
                if (!db[user]) return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay una fecha registrada.\n\n> ¡El olvido es la única muerte real!`);
                delete db[user];
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji3} \`REGISTRO PURGADO\` ${config.visuals.emoji3}*\n\nFecha eliminada correctamente.\n\n> ¡Has vuelto a ser un ser sin tiempo!`);
            }

            if (!args[0]) return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nDebes ingresar tu fecha.\n\n> Ejemplo: #setbirth 15/05/2000`);

            const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            if (!regex.test(args[0])) return m.reply(`*${config.visuals.emoji2} \`FORMATO INVÁLIDO\` ${config.visuals.emoji2}*\n\nUsa: DD/MM/AAAA`);

            const [_, day, month, year] = args[0].match(regex).map(Number);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date(2026, 3, 24); 
            
            let age = today.getFullYear() - birthDate.getFullYear();
            const mDiff = today.getMonth() - birthDate.getMonth();
            if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;

            if (age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2} \`RANGO INVÁLIDO\` ${config.visuals.emoji2}*\n\nSolo se permiten edades entre 8 y 85 años.\n\n> ¡Nacidos entre 1941 y 2018!`);

            db[user] = { birth: args[0], age: age };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3} \`CRONOLOGÍA FIJADA\` ${config.visuals.emoji3}*\n\nFecha: *${args[0]}*\nEdad: *${age} años*\n\n> ¡Tu lugar en el tiempo ha sido asegurado!`);

        } catch (e) {
            m.reply('✘ Error en el registro cronológico.');
        }
    }
};

export default birthdaySystem;