import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['menuts'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, pushName }) => {
        try {
            // Validación para evitar el "undefined" en el saludo
            const nombreUsuario = pushName || m.pushName || 'Usuario';

            // Obtener datos del sistema
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
            const baileysVersion = pkg.dependencies['@whiskeysockets/baileys']?.replace('^', '') || '6.6.0';
            const totalCommands = global.commands ? global.commands.size : '0';

            // Configuración de Hora y Fecha (Santo Domingo)
            const now = new Date();
            const hora = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santo_Domingo" });
            const fecha = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santo_Domingo" });

            const textoMenu = `Hola, el test está en curso.`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼𝓪  𝘽𝙊𝙏 🖤',
                        body: 'Misa Bot | Developed by Yanniel',
                        thumbnailUrl: 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg', 
                        sourceUrl: 'https://github.com/yannielmedrano1-sys/Misa-Bot',
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;