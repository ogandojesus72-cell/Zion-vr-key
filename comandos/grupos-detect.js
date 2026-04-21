import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export const detectHandler = async (conn) => {
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action, author } = update;

            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id]?.detect) return;

            for (let user of participants) {
                const phone = typeof user === 'string' ? user.split('@')[0] : 'usuario';
                const actor = author ? author.split('@')[0] : 'un Administrador';
                let aviso = '';

                if (action === 'promote') {
                    aviso = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\nEl usuario *@${phone}* ha sido promovido a Administrador por *@${actor}*.\n\n> ¡Felicidades por el nuevo cargo!`;
                } else if (action === 'demote') {
                    aviso = `*❁* \`Remoción de Cargo\` *❁*\n\nEl usuario *@${phone}* fue degradado de su cargo por *@${actor}*.\n\n> ¡Seguimos trabajando!`;
                }

                if (aviso) {
                    await conn.sendMessage(id, { 
                        text: aviso, 
                        mentions: [user, author].filter(Boolean) 
                    });
                }
            }
        } catch (e) {
            console.error("Error en Detect Participantes:", e);
        }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.messageStubType) return;
            const chat = m.key.remoteJid;

            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[chat]?.detect) return;

            const actor = m.key?.participant || m.participant || chat;
            const phone = typeof actor === 'string' ? actor.split('@')[0] : 'usuario';
            let cambio = '';

            if (m.messageStubType == 21) cambio = `cambió el nombre a: *${m.messageStubParameters[0]}*`;
            if (m.messageStubType == 22) cambio = `actualizó la foto del grupo.`;
            if (m.messageStubType == 24) cambio = `editó la descripción del grupo.`;
            if (m.messageStubType == 25) cambio = `cambió los permisos de edición a: *${m.messageStubParameters[0] == 'on' ? 'Solo Admins' : 'Todos'}*`;

            if (cambio) {
                await conn.sendMessage(chat, { 
                    text: `*✿︎* \`Aviso de Grupo\` *✿︎*\n\n*@${phone}* ${cambio}\n\n> Kazuma detectó el cambio.`,
                    mentions: [actor]
                });
            }
        } catch (e) {
            console.error("Error en Detect Stub:", e);
        }
    });
};

export default detectHandler;