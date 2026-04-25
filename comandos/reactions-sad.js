import { config } from '../config.js';

const sadCommand = {
    name: 'sad',
    alias: ['triste', 'llorar'],
    category: 'reactions',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            // IMPORTANTE: Estos links deben ser DIRECTOS (.mp4)
            // Si usas links de Pinterest tipo "pin.it", siempre te va a fallar.
            const reactionVideos = [
                'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZueGZ3/l378giAZgxPw3QO52/giphy.mp4',
                'https://i.imgur.com/3vO4XQX.mp4' 
            ];

            const videoUrl = reactionVideos[Math.floor(Math.random() * reactionVideos.length)];
            
            let self = m.sender;
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            let texto = target && target !== self 
                ? `*${config.visuals.emoji3}* @${self.split('@')[0]} está triste porque @${target.split('@')[0]} le hizo algo... *${config.visuals.emoji2}*`
                : `*${config.visuals.emoji3}* @${self.split('@')[0]} se encuentra muy triste. *${config.visuals.emoji2}*`;

            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: texto,
                mimetype: 'video/mp4',
                mentions: [self, ...(target ? [target] : [])]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* El link del video está roto o no es compatible.`);
        }
    }
};

export default sadCommand;