import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['detect', 'antilink', 'welcome'], 
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.chat;
        let feature = '';
        let action = '';

        if (commandName === 'config') {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } else {
            feature = commandName;
            action = args[0]?.toLowerCase();
        }

        const validFeatures = ['detect', 'antilink', 'welcome'];
        if (!validFeatures.includes(feature)) {
            return m.reply(`*${config.visuals.emoji2} \`OPCIÓN INVÁLIDA\` ${config.visuals.emoji2}*\n\nUsa:\n*✿︎* \`${usedPrefix}detect on/off\`\n*✿︎* \`${usedPrefix}antilink on/off\`\n*✿︎* \`${usedPrefix}welcome on/off\``);
        }

        if (!action || !['on', 'off'].includes(action)) {
            return m.reply(`*${config.visuals.emoji2} \`FALTA ESTADO\` ${config.visuals.emoji2}*\n\nEspecifica *on* o *off* para *${feature}*.`);
        }

        const enabled = (action === 'on');

        try {
            if (!fs.existsSync(path.resolve('./jsons'))) fs.mkdirSync(path.resolve('./jsons'), { recursive: true });
            let db = fs.existsSync(databasePath) ? JSON.parse(fs.readFileSync(databasePath, 'utf-8')) : {};

            if (!db[from]) db[from] = { detect: true, antilink: true, welcome: true };

            if (db[from][feature] === enabled) {
                return m.reply(`*${config.visuals.emoji2} \`ESTADO ACTUAL\` ${config.visuals.emoji2}*\n\nLa función *${feature.toUpperCase()}* ya se encuentra *${enabled ? 'Activada' : 'Desactivada'}*.\n\n> ¡No es necesario cambiarlo de nuevo!`);
            }

            db[from][feature] = enabled;
            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3} \`AJUSTE ACTUALIZADO\` ${config.visuals.emoji3}*\n\n*${feature.toUpperCase()}* ha sido *${enabled ? 'Activada' : 'Desactivada'}*.\n\n> ¡Configuración aplicada con éxito!`);
        } catch (err) {
            m.reply('✘ Error al guardar configuración.');
        }
    }
};

export default configOnOff;