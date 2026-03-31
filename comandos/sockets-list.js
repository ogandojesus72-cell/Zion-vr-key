/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'bots',
    alias: ['sockets', 'subbots', 'nodos'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: true, 
    noPrefix: true, // Para que funcione con o sin prefijo

    run: async (conn, m, { isGroup }) => {
        const from = m.chat;

        try {
            // 1. Obtener datos frescos del grupo (Evitamos depender de parámetros externos)
            const groupMetadata = await conn.groupMetadata(from).catch(() => null);
            if (!groupMetadata) return m.reply('❌ Error: No se pudo obtener la información del grupo.');

            // 2. Ruta de sesiones (Ajustada a la estructura de Kazuma)
            const sessionsPath = path.resolve('./sesiones_subbots');
            let totalSubBots = 0;
            if (fs.existsSync(sessionsPath)) {
                totalSubBots = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                }).length;
            }

            // 3. Identificar Sockets Activos
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const activeSubBotsJids = global.subBots ? Array.from(global.subBots.keys()) : []; 

            // Filtro con soporte LID integrado directamente aquí
            const botsInGroup = groupMetadata.participants.filter(p => {
                const jid = p.id;
                const lid = p.lid || null;
                return jid === mainBotJid || activeSubBotsJids.includes(jid) || (lid && activeSubBotsJids.includes(lid));
            });

            // 4. Construir menciones visuales
            let mentionsJid = [];
            let listaMenciones = "";

            botsInGroup.forEach((bot) => {
                const jid = bot.id; 
                mentionsJid.push(jid);
                listaMenciones += `   ➪ @${jid.split('@')[0]}\n`;
            });

            // 5. Cuerpo del mensaje (Estilo Kurayami)
            const texto = `
✿︎ \`LISTA DE SOCKETS ACTIVOS\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots » ${totalSubBots}*

*⌨︎ Nodos en este grupo » ${botsInGroup.length}*

${listaMenciones || "_No se detectaron más nodos de la red._"}
`.trim();

            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentionsJid,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Supervisión de Nodos Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en socket monitor:', err);
        }
    }
};

export default listSocketsCommand;