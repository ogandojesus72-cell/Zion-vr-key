import fs from 'fs';
import path from 'path';

export const config = {
    botName: 'Zion-vr-key',
    owner: [
        '18299839355@s.whatsapp.net', 
        '12586030889859@lid'
    ], 
    prefix: '#',
    allPrefixes: ['#', '!', '.'],

    getBotType: (conn) => {
        const userNumber = conn.user.id.split(':')[0];
        const subBotPath = path.resolve(`./sesiones_subbots/${userNumber}`);
        return fs.existsSync(subBotPath) ? '*Sub-Bot*' : '*Mood*';
    },

    visuals: {
        line: '━',
        color: 'magenta',
        emoji: '✰',
        emoji2: '❁',
        emoji3: '✿',
        emoji4: '❀',
        img1: 'https://files.catbox.moe/9ssbf9.jpg'
    },

    apiNex: 'NEX-0868C926ADF94B19A51E18C4'
};
