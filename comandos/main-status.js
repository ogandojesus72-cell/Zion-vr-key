/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import os from 'os';
import { config } from '../config.js';

const statusCommand = {
    name: 'status',
    alias: ['botinfo', 'infobot'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            // --- CÁLCULO DE TIEMPO ACTIVO ---
            const uptimeSeconds = process.uptime();
            const d = Math.floor(uptimeSeconds / (3600 * 24));
            const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
            const m_time = Math.floor((uptimeSeconds % 3600) / 60);
            const s = Math.floor(uptimeSeconds % 60);
            const uptimeDisplay = `${d}d ${h}h ${m_time}m ${s}s`;

            // --- CÁLCULO DE RAM ---
            const totalRam = (os.totalmem() / (1024 * 1024)).toFixed(0);
            const usedRam = ((os.totalmem() - os.freemem()) / (1024 * 1024)).toFixed(0);

            // --- CÁLCULO DE CPU ---
            const cpus = os.cpus();
            const cpuModel = cpus[0].model;
            const cpuCores = cpus.length; 

            // --- CÁLCULO DE DISCO (Aproximado) ---
            const totalDisk = "500MB"; 

            const textoStatus = `
✿︎ Nombre del bot ᗒ *${config.botName}*
❁ Tiempo activo ᗒ *${uptimeDisplay}*
❀ Comandos usados ᗒ *${global.totalCommandsUsed || 0}*

ᗣ RAM ᗒ *${usedRam}MB / ${totalRam}MB*
⁂ CPU ᗒ *${cpuCores} vCores* (${cpuModel.split(' ')[0]})
𖧷 DISCO ᗒ *En uso / ${totalDisk}*

> DEVELOPED BY FÉLIX OFC`.trim();

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoStatus,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SYSTEM STATUS',
                        body: `Server: ${os.platform()} - ${os.arch()}`,
                        // Nueva foto de Catbox
                        thumbnailUrl: 'https://files.catbox.moe/5fli7o.jpg', 
                        mediaType: 1,
                        // MINIATURA PEQUEÑA (Solo en este comando)
                        renderLargerThumbnail: false 
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando status:', err);
        }
    }
};

export default statusCommand;