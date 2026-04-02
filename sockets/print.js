import chalk from 'chalk';

/**
 * Logger personalizado para Sub-Bots - Versión Anti-Crash
 * @param {Object} m 
 * @param {import('@whiskeysockets/baileys').WASocket} conn 
 */
export const socketLogger = (m, conn) => {
    try {
        // 1. Validación de seguridad: si el mensaje está vacío, ignoramos
        if (!m || !m.message || !m.key) return;

        const from = m.key.remoteJid;
        if (!from) return;

        const isGroup = from.endsWith('@g.us');
        const name = m.pushName || 'Sub-Bot User';

        // 2. CORRECCIÓN CRÍTICA: Validar sender antes del split
        const sender = isGroup ? (m.key.participant || from) : from;
        const senderNumber = sender ? sender.split('@')[0] : '000000';

        // 3. Detectar tipo de mensaje de forma segura
        const type = Object.keys(m.message)[0];
        if (!type || type === 'protocolMessage' || type === 'senderKeyDistributionMessage') return;

        let body = '';
        if (type === 'conversation') {
            body = m.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage?.text || '';
        } else if (type === 'imageMessage') {
            body = '[Imagen]';
        } else if (type === 'videoMessage') {
            body = '[Video]';
        } else {
            body = `[${type.replace('Message', '')}]`;
        }

        // 4. Formatear salida con validación de grupo
        const groupInfo = isGroup ? chalk.yellow(` (Grupo: ${from.split('@')[0]})`) : '';
        const time = new Date().toLocaleTimeString();

        console.log(
            chalk.magenta(`[SUB-BOT]`) + 
            chalk.blue(`[${time}]`) + 
            chalk.cyan(` ${name} (${senderNumber}): `) + 
            chalk.white(body.length > 50 ? body.substring(0, 50) + '...' : body) +
            groupInfo
        );

    } catch (e) {
        // En caso de error, el bot sigue vivo
        console.error(chalk.red(`  [⚠️ Sub-Bot Logger Error]: ${e.message}`));
    }
};