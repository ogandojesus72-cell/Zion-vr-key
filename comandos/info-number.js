/* KURAYAMI TEAM - ID HUNTER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
   Propósito: Debug de Identidad (JID/LID)
*/

export default {
    name: 'number',
    alias: ['id', 'myid', 'identidad'],
    category: 'tools',
    noPrefix: true, // Prioridad absoluta como pediste

    run: async (conn, m) => {
        try {
            // Extraemos los datos crudos del mensaje
            const jid = m.key.participant || m.key.remoteJid;
            const lid = m.messageStubParameters && m.messageStubParameters[0] ? m.messageStubParameters[0] : (m.pushName ? 'No detectado en este evento' : 'Buscando...');
            
            // Intentamos sacar el LID de las propiedades internas de Baileys si están disponibles
            const alternativeLid = m.sender || jid;

            const texto = `
★ INFO NUMBER ★

*Jid:* ${jid}
*Lid:* ${m.sender || 'No disponible'}

> ¡Úsalo con sabiduría! 😈
`.trim();

            await conn.sendMessage(m.chat, { 
                text: texto,
                contextInfo: {
                    externalAdReply: {
                        title: 'KURAYAMI ID-SCANNER',
                        body: 'Extrayendo metadatos de red...',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

            // Log en consola para que tú lo veas en el panel también
            console.log(`\n[🔍] ESCANEO DE ID:\nUser: ${m.pushName}\nJID: ${jid}\nSENDER: ${m.sender}\n`);

        } catch (err) {
            console.error('Error en comando number:', err);
        }
    }
};