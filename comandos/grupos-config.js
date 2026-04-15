/* KAZUMA MISTER BOT - CONFIGURACIÓN DE GRUPO */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['on', 'off', 'detect', 'antilink'],
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true, // Tu sello distintivo

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;
        let feature, action;

        // --- LÓGICA DE DETECCIÓN DE ARGUMENTOS ---
        // Si el usuario usa el nombre base: #config antilink on
        if (commandName === 'config') {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } else {
            // Si usa un alias: #antilink on / #detect off
            feature = commandName; 
            action = args[0]?.toLowerCase();
        }

        const validFeatures = ['detect', 'antilink'];

        // 1. Validar que la función exista
        if (!validFeatures.includes(feature)) {
            return m.reply(`*❁* \`Opción Inválida\` *❁*\n\nFunciones disponibles:\n*✿︎* \`detect\`\n*✿︎* \`antilink\`\n\n> Ejemplo: *${usedPrefix}${commandName === 'config' ? 'config antilink' : feature} on*`);
        }

        // 2. Validar que se haya pasado una acción (on/off)
        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return m.reply(`*❁* \`Estado Faltante\` *❁*\n\n¿Quieres activar o desactivar *${feature}*?\n\n*✿︎ Opciones:* \`on / off\``);
        }

        const enabled = ['on', 'enable'].includes(action);

        // --- GESTIÓN DEL ARCHIVO JSON ---
        try {
            if (!fs.existsSync(path.resolve('./jsons'))) {
                fs.mkdirSync(path.resolve('./jsons'), { recursive: true });
            }

            let db = {};
            if (fs.existsSync(databasePath)) {
                const rawData = fs.readFileSync(databasePath, 'utf-8');
                db = rawData ? JSON.parse(rawData) : {};
            }
            
            if (!db[from]) db[from] = {};
            db[from][feature] = enabled;
            
            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

            // --- RESPUESTA VISUAL ---
            await conn.sendMessage(from, { 
                text: `*✿︎* \`Ajuste Actualizado\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ahora está: **${enabled ? 'ACTIVADA' : 'DESACTIVADA'}**.\n\n> Configuración guardada para este grupo.` 
            }, { quoted: m });

        } catch (err) {
            console.error('Error guardando config:', err);
            m.reply('*❁* `Error Interno` *❁*\n\nNo se pudo guardar la configuración en el archivo JSON.');
        }
    }
};

export default configOnOff;