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
            const isMainBot = conn.user.id.includes('session_bot') || !m.sender.includes(':');
            const user = m.sender.split('@')[0].split(':')[0];
            const isPrincipalOwner = config.owner.includes(m.sender);

            const folderPath = isMainBot ? path.resolve('./session_bot') : path.resolve(`./sesiones_subbots/${botNumber}`);
            const userSettingsPath = path.join(folderPath, 'settings.json');

            if (!fs.existsSync(folderPath)) fs.mkdirpSync(folderPath);

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) localConfig = await fs.readJson(userSettingsPath);

            const allowedToSet = localConfig.owner || botNumber;
            if (user !== allowedToSet && !isPrincipalOwner) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* No tienes permisos.` }, { quoted: m });
            }

            if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Ingresa el número.`);

            const newOwner = args[0].replace(/[^0-9]/g, '');
            localConfig.owner = newOwner;
            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3} \`OWNER ASIGNADO\` ${config.visuals.emoji3}*\n\nAhora @${newOwner} es el único que puede configurar este bot.`, 
                mentions: [`${newOwner}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};

export default setOwner;