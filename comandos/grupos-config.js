/* KAZUMA MISTER BOT - CONFIGURACIÓN DE GRUPO */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['on', 'off', 'detect', 'alertas'],
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true, // El sello distintivo de Kazuma

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;
        
        // Identificamos la función y la acción
        const feature = (commandName === 'config') ? args[0]?.toLowerCase() : 'detect';
        const action = (commandName === 'config') ? args[1]?.toLowerCase() : args[0]?.toLowerCase();

        if (feature !== 'detect') {
            return m.reply(`*❁* \`Error de Función\` *❁*\n\nPor ahora solo puedes configurar: *detect*.\n\n> Ejemplo: *${usedPrefix}detect on*`);
        }

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return m.reply(`*❁* \`Estado Faltante\` *❁*\n\n¿Qué quieres hacer con *${feature}*?\n\n*✿︎ Opciones:* \`on / off\`\n\n> Ejemplo: *${usedPrefix}${commandName} on*`);
        }

        const enabled = ['on', 'enable'].includes(action);

        // Manejo de base de datos JSON
        if (!fs.existsSync(path.resolve('./jsons'))) fs.mkdirSync(path.resolve('./jsons'));
        let db = fs.existsSync(databasePath) ? JSON.parse(fs.readFileSync(databasePath, 'utf-8')) : {};
        
        if (!db[from]) db[from] = {};
        db[from][feature] = enabled;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Ajuste Aplicado\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ha sido **${enabled ? 'ACTIVADA' : 'DESACTIVADA'}**.\n\n> ¡Kazuma ahora está en modo ${enabled ? 'vigilante' : 'reposo'}!` 
        }, { quoted: m });
    }
};

export default configOnOff;