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
            const from = m.chat;
            const botNumber = conn.user.id.split(':')[0];
            const isMainBot = conn.user.id.includes('session_bot');
            const user = m.sender.split('@')[0].split(':')[0];
            const isPrincipalOwner = config.owner.includes(m.sender);

            const sessionsPath = path.resolve(isMainBot ? './session_bot' : './sesiones_subbots');
            const folderPath = isMainBot ? sessionsPath : path.join(sessionsPath, botNumber);
            const userSettingsPath = path.join(folderPath, 'settings.json');

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) {
                localConfig = await fs.readJson(userSettingsPath);
            }

            const allowedUser = localConfig.owner || botNumber;
            if (user !== allowedUser && !isPrincipalOwner) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Solo el owner asignado (@${allowedUser}) puede usar este comando.` }, { quoted: m });
            }

            const fullText = args.join(' ');
            if (!fullText) return m.reply(`*${config.visuals.emoji2}* Usa: #setname Corto/Largo`);

            let shortName, longName;
            if (fullText.includes('/')) {
                let [part1, ...part2] = fullText.split('/');
                shortName = part1.trim();
                longName = part2.join('/').trim();
                if (shortName.includes(' ')) return m.reply(`*${config.visuals.emoji2}* El nombre corto no puede tener espacios.`);
            } else {
                shortName = fullText.trim();
                longName = fullText.trim();
            }

            localConfig.shortName = shortName;
            localConfig.longName = longName;
            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            await conn.sendMessage(from, { text: `*${config.visuals.emoji3}* Nombre actualizado para este bot.` }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};

export default setBotName;