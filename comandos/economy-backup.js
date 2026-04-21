import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/daily.json');

const economyTestCommand = {
    name: 'economy-test',
    alias: ['test', 'backup-eco'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\n\nNo se encontró el archivo de base de datos.`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');
            
            const textoExport = `*${config.visuals.emoji3}* \`BACKUP ECONOMÍA\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Archivo:* daily.json\n*${config.visuals.emoji4} Estado:* Listo para migración\n\n\`\`\`${dbContent}\`\`\``;

            await conn.sendMessage(m.chat, { 
                text: textoExport,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SYSTEM BACKUP',
                        body: 'Copia de seguridad de base de datos',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* \`Error en Backup\` *${config.visuals.emoji2}*\nNo se pudo leer la base de datos.`);
        }
    }
};

export default economyTestCommand;