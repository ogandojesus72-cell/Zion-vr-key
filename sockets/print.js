import chalk from 'chalk';

export const socketLogger = (m, conn) => {
    try {
        if (!m || !m.message || !m.key || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const name = m.pushName || 'Sub-Bot User';
        const sender = isGroup ? (m.key.participant || from) : from;
        const senderNumber = sender ? sender.split('@')[0] : '000000';

        const type = Object.keys(m.message).find(t => t !== 'senderKeyDistributionMessage' && t !== 'messageContextInfo') || '';
        if (!type || type === 'protocolMessage') return;

        let body = '';
        const msg = m.message[type];

        if (type === 'conversation') {
            body = m.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = msg?.text || '';
        } else if (type === 'imageMessage') {
            body = '📷 Imagen';
        } else if (type === 'videoMessage') {
            body = '🎥 Video';
        } else if (type === 'stickerMessage') {
            body = '🏷️ Sticker';
        } else {
            body = `📦 ${type.replace('Message', '')}`;
        }

        const groupInfo = isGroup ? chalk.yellow(` (G:${from.split('@')[0]})`) : chalk.green(` (P)`);
        const time = new Date().toLocaleTimeString();

        console.log(
            chalk.magenta(`[SUB-BOT]`) + 
            chalk.blue(`[${time}]`) + 
            chalk.cyan(` ${name} (${senderNumber}): `) + 
            chalk.white(body.length > 50 ? body.substring(0, 50) + '...' : body) +
            groupInfo
        );

    } catch (e) {
        console.error(chalk.red(`  [⚠️ Sub-Bot Logger Error]: ${e.message}`));
    }
};