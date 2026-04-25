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

            const fullText = args.join(' ');
            if (!fullText) {
                return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nUsa: #setname Corto/Largo Largo Largo`);
            }

            let shortName, longName;

            if (fullText.includes('/')) {
                let [part1, ...part2] = fullText.split('/');
                shortName = part1.trim();
                longName = part2.join('/').trim();

                if (shortName.includes(' ')) {
                    return m.reply(`*${config.visuals.emoji2}* El nombre corto antes de la \`/\` no puede tener espacios.`);
                }
            } else {
                shortName = fullText.trim();
                longName = fullText.trim();
            }

            if (!shortName || !longName) {
                return m.reply(`*${config.visuals.emoji2}* Asegúrate de llenar ambos lados de la barra.`);
            }

            const sessionsPath = path.resolve('./sesiones_subbots');
            const userSettingsPath = path.join(sessionsPath, botNumber, 'settings.json');

            if (!fs.existsSync(path.join(sessionsPath, botNumber))) {
                return m.reply(`*${config.visuals.emoji2}* Carpeta de sesión no encontrada.`);
            }

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) {
                localConfig = await fs.readJson(userSettingsPath);
            }

            localConfig.shortName = shortName;
            localConfig.longName = longName;
            localConfig.lastUpdate = Date.now();

            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            await m.reply(`*${config.visuals.emoji3} \`CONFIGURACIÓN LOCAL\` ${config.visuals.emoji3}*\n\nNombres guardados correctamente.\n\n*Corto:* ${shortName}\n*Largo:* ${longName}\n\n> Separador \`/\` detectado con éxito.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al guardar el nombre.`);
        }
    }
};

export default setBotName;