/* KURAYAMI TEAM - PREFIX MANAGER 
   Categoría: OWNER | Archivo: owner-prefix.js
*/

import fs from 'fs';
import path from 'path';

export default {
    name: 'setprefix',
    alias: ['prefix', 'setprefijo'],
    category: 'owner',
    isOwner: true, 

    run: async (conn, m, { args, config }) => {
        const newPrefix = args[0];
        const allowed = ['#', '!', '.'];

        if (!newPrefix || !allowed.includes(newPrefix)) {
            return m.reply(`❌ Prefijo no válido. Elige uno de estos: ${allowed.join(' ')}`);
        }

        try {
            const configPath = path.resolve('./config.js');
            let content = fs.readFileSync(configPath, 'utf8');

            // Buscamos la línea del prefijo y la reemplazamos físicamente
            const updatedContent = content.replace(
                /prefix:\s*['"].+['"]/, 
                `prefix: '${newPrefix}'`
            );

            fs.writeFileSync(configPath, updatedContent);
            
            // Actualizamos la memoria inmediata
            config.prefix = newPrefix;

            await conn.sendMessage(m.chat, { 
                text: `✅ *CONFIGURACIÓN ACTUALIZADA*\n\nEl prefijo global de **${config.botName}** ahora es: *${newPrefix}*\n\n_Nota: Los comandos sin prefijo seguirán funcionando normalmente._`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply('❌ Error al intentar escribir en config.js. Revisa los permisos del archivo.');
        }
    }
};