import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

// Exportamos la función para que el index/main la pueda usar
export const detectHandler = async (conn, update) => {
    const { id, participants, action } = update;

    if (!fs.existsSync(databasePath)) return;

    try {
        const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
        
        // Verificamos si el grupo tiene el 'detect' encendido en el JSON
        if (!db[id] || !db[id].detect) return;

        for (let user of participants) {
            let text = '';
            
            if (action === 'promote') {
                text = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\nSe han otorgado poderes de moderación a:\n*@${user.split('@')[0]}*\n\n> ¡Felicidades por el nuevo cargo en el grupo!`;
            } else if (action === 'demote') {
                text = `*❁* \`Remoción de Cargo\` *❁*\n\nSe han retirado los poderes de administrador a:\n*@${user.split('@')[0]}*\n\n> ¡Esperamos que sigas aportando como miembro!`;
            }

            if (text) {
                await conn.sendMessage(id, { 
                    text, 
                    mentions: [user] 
                });
            }
        }
    } catch (e) {
        console.error("Error en comandos/grupos-detect.js:", e);
    }
};

// Dejamos un export default vacío o con info para que el cargador de comandos no se rompa si intenta leerlo
export default {
    name: 'grupos-detect',
    category: 'grupo',
    type: 'event' // Esto indica que no es un comando de texto
};