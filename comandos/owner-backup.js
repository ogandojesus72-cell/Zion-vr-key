import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const backupCommand = {
    name: 'backup',
    alias: ['test', 'backup'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\n\nNo se encontró la base de datos economy.json.`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');
            
            const textoExport = `*${config.visuals.emoji3}* \`BACKUP ECONOMÍA\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Archivo:* economy.json\n*${config.visuals.emoji4} Estado:* Sincronizado\n\n\`\`\`${dbContent}\`\`\``;

            await conn.sendMessage(m.chat, { 
                text: textoExport,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - DATABASE',
                        body: 'Respaldo general de economía',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\nNo se pudo extraer la base de datos.`);
        }
    }
};

export default backupCommand;