import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#';
            const botType = config.getBotType(conn);
            const totalCommands = global.commands.size;

            const textoMenu = `¡Hola! Soy *${config.botName}* (${botType}), un placer atenderte.

┌──── *INFO - BOT* ────┐
│ *Owner* » 
│ Félix
│ *TotalCommands* »
│  ${totalCommands}
│ *Upload* »
│ upload.yotsuba.giize.com
│ *Commands* »
│ kazama.giize.com/commands
└──────────────┘
‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
*» (❍ᴥ❍ʋ) \`MAIN\` «*
> ꕥ Comandos principales del bot.

*✿︎ ${prefix}help • ${prefix}menu • ${prefix}ayuda*
> ❀ Solicita la lista de comandos.
*✿︎ ${prefix}p • ${prefix}ping*
> ❀ Latencia del bot.

*» (❍ᴥ❍ʋ) \`TOOLS\` «*
> ꕥ Herramientas útiles.

*✿︎ ${prefix}tourl • ${prefix}subir*
> ❀ Convierte una imagen o sticker en un enlace de Yotsuba Cloud.

*» (❍ᴥ❍ʋ) \`SOCKETS\` «*
> ꕥ Comandos de los subbots.

*✿︎ ${prefix}code*
> ❀ Hazte SubBot de Kazuma.
*✿︎ ${prefix}bots • ${prefix}sockets*
> ❀ Mira la lista de sockets activos.

*» (❍ᴥ❍ʋ) \`GESTIÓN\` «*
> ꕥ Comandos de grupo.

*✿︎ ${prefix}detect on/off*
> ❀ Avisos en el grupo.
*✿︎ ${prefix}antilink on/off*
> ❀ Protector de enlaces.

*» (❍ᴥ❍ʋ) \`DESCARGAS\` «*
> ꕥ Multimedia de redes.

*✿︎ ${prefix}ytv* • *${prefix}yta*
> ❀ Descarga videos/audios de YouTube.

*» (❍ᴥ❍ʋ) \`OWNER\` «*
> ꕥ Comandos del creador.

*✿︎ ${prefix}update*
> ❀ Actualiza el servidor via Git.`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: `Kazuma`,
                        body: 'Kazuma Bot | Developed by Félix',
                        thumbnailUrl: config.visuals.img1, 
                        sourceUrl: 'https://kazuma.giize.com', 
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