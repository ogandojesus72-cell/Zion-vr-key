import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots', 'lista'],
    category: 'sockets',
    noPrefix: true,
    isGroup: true, // El handler se encargará de rebotar si es privado

    run: async (conn, m) => {
        try {
            const sessionsPath = path.resolve('./sesiones_subbots');
            const mainBotNumber = conn.user.id.split(':')[0];
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id.split('@')[0]);

            let totalSubs = 0;
            let subBotsList = '';
            let mentions = [];

            // --- LÓGICA PARA EL BOT PRINCIPAL ---
            // El principal siempre se muestra si está respondiendo, pero verificamos nombre
            let mainName = config.botName;
            const mainSettingsPath = path.resolve(`./sesiones_subbots/${mainBotNumber}/settings.json`);
            
            if (await fs.pathExists(mainSettingsPath)) {
                const mainData = await fs.readJson(mainSettingsPath);
                mainName = mainData.shortName || mainData.longName || config.botName;
            }
            
            mentions.push(`${mainBotNumber}@s.whatsapp.net`);
            let mainLine = `  ➪ *[Principal ${mainName}]* » @${mainBotNumber}`;

            // --- LÓGICA PARA LOS SUB-BOTS (FILTRADO POR GRUPO) ---
            if (await fs.pathExists(sessionsPath)) {
                const folders = await fs.readdir(sessionsPath);

                for (const folder of folders) {
                    const fullPath = path.join(sessionsPath, folder);
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    
                    // SEGURIDAD: Solo agregar si el número del sub-bot está en la lista de participantes del grupo
                    if (num && num !== mainBotNumber && participants.includes(num)) {
                        let subName = config.botName; 
                        const subSettingsPath = path.join(fullPath, 'settings.json');

                        if (await fs.pathExists(subSettingsPath)) {
                            try {
                                const subData = await fs.readJson(subSettingsPath);
                                subName = subData.shortName || subData.longName || config.botName;
                            } catch (e) {
                                subName = config.botName; 
                            }
                        }

                        subBotsList += `  ➪ *[Sub-Bot ${subName}]* » @${num}\n`;
                        mentions.push(`${num}@s.whatsapp.net`);
                        totalSubs++;
                    }
                }
            }

            // --- CONSTRUCCIÓN DEL MENSAJE ---
            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            // Cambiado "DETALLE" por "EN ESTE GRUPO" como pediste
            const stats = `\n\n*❁ Principal » 1*\n*❀ Subs en este grupo » ${totalSubs}*\n\n*❀ EN ESTE GRUPO:*`;
            
            const textoFinal = `${header}${stats}\n${mainLine}\n${subBotsList}\n\n> ¡Sistemas operativos y estables en esta comunidad!`;

            await conn.sendMessage(m.chat, { 
                text: textoFinal.trim(),
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error('Error en comando sockets:', e);
            m.reply(`*${config.visuals.emoji2}* Error al filtrar los sockets del grupo.`);
        }
    }
};