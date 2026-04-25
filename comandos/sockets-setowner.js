import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const setOwner = {
    name: 'setowner',
    alias: ['setown', 'dueñobot'],
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

            const allowedToSet = localConfig.owner || botNumber;
            if (user !== allowedToSet && !isPrincipalOwner) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* No tienes permisos para asignar un owner.` }, { quoted: m });
            }

            if (!args[0]) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Ingresa el número de la persona.` }, { quoted: m });
            }

            const newOwner = args[0].replace(/[^0-9]/g, '');
            localConfig.owner = newOwner;
            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            const successMsg = `*${config.visuals.emoji3} \`OWNER ASIGNADO\` ${config.visuals.emoji3}*\n\nAhora @${newOwner} es el único que puede configurar este socket.\n\n> Registro guardado en la sesión.`;

            await conn.sendMessage(from, { text: successMsg, mentions: [`${newOwner}@s.whatsapp.net`] }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};

export default setOwner;