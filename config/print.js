import chalk from 'chalk';

export const logger = (m, conn) => {
    try {
        if (!m || !m.message || !m.key || m.key.remoteJid === 'status@broadcast') return;

        const time = new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (m.key.participant || from) : from;
        const pushName = m.key.fromMe ? 'PIXEL-CREW (YO)' : (m.pushName || 'Usuario');
        const number = sender ? sender.split('@')[0] : '000000';

        const messageType = Object.keys(m.message).find(t => t !== 'senderKeyDistributionMessage' && t !== 'messageContextInfo') || '';
        if (!messageType || messageType === 'protocolMessage') return;

        let content = '';
        const msg = m.message[messageType];

        if (messageType === 'conversation') {
            content = m.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            content = msg?.text || '';
        } else if (messageType === 'imageMessage') {
            content = msg?.caption || '📸 Imagen';
        } else if (messageType === 'videoMessage') {
            content = msg?.caption || '🎥 Video';
        } else if (messageType === 'stickerMessage') {
            content = '🖼️ Sticker';
        } else if (messageType === 'documentWithCaptionMessage') {
            content = msg?.message?.documentMessage?.caption || '📄 Documento';
        } else {
            content = `📦 [${messageType.replace('Message', '')}]`;
        }

        const chatLabel = isGroup ? chalk.black.bgMagenta(' GRUPO ') : chalk.black.bgCyan(' PRIVADO ');
        const timeLabel = chalk.gray(`[${time}]`);
        const userLabel = m.key.fromMe ? chalk.greenBright(`${pushName}`) : chalk.yellow(`${pushName} (${number})`);
        const typeLabel = chalk.blueBright(`[${messageType.replace('Message', '').toUpperCase()}]`);

        console.log(`${timeLabel} ${chatLabel} ${userLabel} ${typeLabel}: ${chalk.white(content.substring(0, 70))}${content.length > 70 ? '...' : ''}`);

    } catch (e) {
        console.error(chalk.red(`  [⚠️ Logger Error]: ${e.message}`));
    }
};