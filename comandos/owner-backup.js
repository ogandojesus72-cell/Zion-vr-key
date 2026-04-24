import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const backupCommand = {
    name: 'backup',
    alias: ['test', 'getdb'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const folder = args[0];
            const file = args[1];

            if (!folder || !file) {
                return m.reply(`*${config.visuals.emoji2} \`PARÁMETROS INCOMPLETOS\` ${config.visuals.emoji2}*\n\nDebes especificar la carpeta y el nombre del archivo exacto.\n\n> Ejemplo: #backup profile genres\n> Ejemplo: #backup economy economy`);
            }

            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2} \`ARCHIVO NO ENCONTRADO\` ${config.visuals.emoji2}*\n\nLa ruta \`config/database/${folder}/${file}.json\` no existe.\n\n> ¡Verifica el nombre y la carpeta antes de intentar!`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');
            
            if (dbContent.length > 4000) {
                await conn.sendMessage(m.chat, { 
                    document: fs.readFileSync(dbPath), 
                    mimetype: 'application/json', 
                    fileName: `${file}.json`,
                    caption: `*${config.visuals.emoji3} \`ARCHIVO PESADO DETECTADO\` ${config.visuals.emoji3}*\n\nEl contenido es muy extenso para un texto, te envío el archivo directo.\n\n> ¡Backup de ${file} completado!`
                }, { quoted: m });
            } else {
                const texto = `*${config.visuals.emoji3} \`RESPALDO DE DATOS\` ${config.visuals.emoji3}*\n\n*Ruta:* config/database/${folder}/${file}.json\n\n\`\`\`${dbContent}\`\`\`\n\n> ¡Copia este contenido para restaurar manualmente!`;
                await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
            }

        } catch (e) {
            m.reply(`*${config.visuals.emoji2} \`ERROR CRÍTICO\` ${config.visuals.emoji2}*\n\nNo se pudo acceder a la base de datos solicitada.\n\n> ¡Revisa la consola para más detalles!`);
        }
    }
};

export default backupCommand;
