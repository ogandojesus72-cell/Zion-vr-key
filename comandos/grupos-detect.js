/* KAZUMA MISTER BOT - EVENT DETECTOR (SILENT) */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export default async (conn) => {
    // Escucha de participantes (Promote/Demote)
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action, author } = update;
        
        if (!fs.existsSync(databasePath)) return;
        const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
        if (!db[id]?.detect) return;

        for (let user of participants) {
            const phone = user.split('@')[0];
            const actor = author ? author.split('@')[0] : 'Sistema';
            let aviso = '';

            if (action === 'promote') {
                aviso = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\nEl usuario *@${phone}* subió a admin por obra de *@${actor}*.\n\n> ¡Felicidades por el nuevo rango!`;
            } else if (action === 'demote') {
                aviso = `*❁* \`Remoción de Cargo\` *❁*\n\nEl usuario *@${phone}* fue degradado por *@${actor}*.\n\n> ¡A seguir participando!`;
            }

            if (aviso) {
                await conn.sendMessage(id, { text: aviso, mentions: [user, author].filter(Boolean) });
            }
        }
    });

    // Escucha de cambios de configuración del grupo
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.messageStubType) return;
        const chat = m.key.remoteJid;

        if (!fs.existsSync(databasePath)) return;
        const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
        if (!db[chat]?.detect) return;

        const actor = m.key?.participant || m.participant || chat;
        const phone = actor.split('@')[0];
        let cambio = '';

        if (m.messageStubType == 21) cambio = `cambió el nombre a: *${m.messageStubParameters[0]}*`;
        if (m.messageStubType == 22) cambio = `actualizó la foto del grupo.`;
        if (m.messageStubType == 24) cambio = `editó la descripción del grupo.`;

        if (cambio) {
            await conn.sendMessage(chat, { 
                text: `*✿︎* \`Aviso de Grupo\` *✿︎*\n\n*@${phone}* ${cambio}\n\n> Cambio detectado por Kazuma.`,
                mentions: [actor]
            });
        }
    });
};