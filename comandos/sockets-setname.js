import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const setBotName = {
    name: 'setname',
    alias: ['setbotname', 'botname', 'nombrebot'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0];
            const isOwner = config.owner.includes(m.sender);

            if (botNumber !== user && !isOwner) {
                return m.reply(`*${config.visuals.emoji2}* Solo el dueño de este socket puede personalizar su nombre.`);
            }

            if (!args[0]) {
                return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nIngresa al menos un nombre para el bot.`);
            }

            let shortName, longName;

            if (args.length === 1) {
                shortName = args[0];
                longName = args[0];
            } else {
                shortName = args[0];
                longName = args.slice(1).join(' ');
            }

            const sessionsPath = path.resolve('./sesiones_subbots');
            const userSettingsPath = path.join(sessionsPath, botNumber, 'settings.json');

            if (!fs.existsSync(path.join(sessionsPath, botNumber))) {
                return m.reply(`*${config.visuals.emoji2}* No se encontró la carpeta de sesión.`);
            }

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) {
                localConfig = await fs.readJson(userSettingsPath);
            }

            localConfig.shortName = shortName;
            localConfig.longName = longName;
            localConfig.lastUpdate = Date.now();

            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            await m.reply(`*${config.visuals.emoji3} \`CONFIGURACIÓN LOCAL\` ${config.visuals.emoji3}*\n\nNombre actualizado correctamente.\n\n*Corto:* ${shortName}\n*Largo:* ${longName}\n\n> ¡Ajuste guardado en tu sesión!`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al guardar el nombre.`);
        }
    }
};

export default setBotName;