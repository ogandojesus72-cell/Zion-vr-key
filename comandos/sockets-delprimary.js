import fs from 'fs';
import path from 'path';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'preferencias.json');

const delPrimary = {
    name: 'delprimary',
    alias: ['delprimary', 'removerprincipal', 'todoshablen'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        if (!fs.existsSync(databasePath)) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Sin configuración\` *❁*\n\nNo hay ningún bot primario asignado en este grupo actualmente.\n\n> ¡Todos los bots tienen permiso de respuesta!` 
            }, { quoted: m });
        }

        let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));

        if (!db[from]) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Aviso\` *❁*\n\nEste grupo no tiene un bot primario fijo. Todos los sockets están activos.\n\n> ¡No hay nada que remover!` 
            }, { quoted: m });
        }

        // Eliminamos la restricción del grupo
        delete db[from];
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Restricción Removida\` *✿︎*\n\nSe ha eliminado el bot primario con éxito. Ahora todos los sockets responderán a los comandos.\n\n> ¡La libertad ha vuelto al grupo!` 
        }, { quoted: m });
    }
};

export default delPrimary;