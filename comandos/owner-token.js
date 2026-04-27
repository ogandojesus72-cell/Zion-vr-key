import fs from 'fs-extra';
import path from 'path';
import { masterAuth } from '../config/database/security/authorization/master/core.js';
import { config } from '../config.js';

export default {
    name: 'token',
    alias: ['generartoken', 'newtoken'],
    category: 'owner',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const sender = m.sender;
            const isMaster = sender === masterAuth.realOwner || sender === masterAuth.realLid;

            if (!isMaster) {
                return m.reply(`*${config.visuals.emoji2}* Acceso denegado. Solo el Mood principal puede generar tokens.`);
            }

            const token = Math.floor(1000 + Math.random() * 9000).toString();
            const tokensPath = path.resolve('./jsons/tokens');
            const tokenFile = path.join(tokensPath, `${token}.json`);

            await fs.ensureDir(tokensPath);

            const tokenData = {
                token: token,
                createdAt: Date.now(),
                expiresAt: Date.now() + (masterAuth.tokenExpiry * 60000),
                status: 'unused'
            };

            await fs.writeJson(tokenFile, tokenData);

            let msg = `*${config.visuals.emoji3} \`TOKEN GENERADO\` ${config.visuals.emoji3}*\n\n`;
            msg += `*✿ Token:* \`${token}\`\n`;
            msg += `*✿ Validez:* ${masterAuth.tokenExpiry} minutos\n\n`;
            msg += `> Usa este código para vincular un nuevo SubMood. Una vez usado, el token se auto-eliminará.`;

            await m.reply(msg);

            setTimeout(async () => {
                if (await fs.pathExists(tokenFile)) {
                    await fs.remove(tokenFile);
                }
            }, masterAuth.tokenExpiry * 60000);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al generar el token.`);
        }
    }
};