import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config.js';
import chalk from 'chalk';

const execPromise = promisify(exec);

const updateCommand = {
    name: 'update',
    alias: ['actualizar', 'gitpull'],
    category: 'owner',
    isOwner: true, // Solo tú puedes usarlo
    isGroup: false,

    run: async (conn, m, { prefix }) => {
        const from = m.key.remoteJid;

        try {
            // 1. Reaccionar con Reloj (Iniciando)
            await conn.sendMessage(from, { react: { text: '⌚', key: m.key } });

            // 2. Ejecutar Git Pull
            // Usamos --ff-only para evitar que el bot intente hacer un "merge" interactivo que rompa la consola
            const { stdout, stderr } = await execPromise('git pull');

            // 3. Verificar si ya está actualizado
            if (stdout.includes('Already up to date')) {
                await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                return await conn.sendMessage(from, { text: '✅ *El bot ya está actualizado con la última versión de GitHub.*' }, { quoted: m });
            }

            // 4. Si hay cambios, intentar recargar los comandos en memoria (Hot Reload)
            // Esto funciona gracias al cargador dinámico que pusimos en el index.js
            if (global.loadCommands) {
                await global.loadCommands(); 
            }

            // 5. Reacción de éxito y mensaje
            await conn.sendMessage(from, { react: { text: '☑️', key: m.key } });

            let updateMsg = `✅ *Actualización realizada exitosamente*\n\n`;
            updateMsg += `*Update:* \n`;
            updateMsg += `\`\`\`${stdout}\`\`\``;

            await conn.sendMessage(from, { text: updateMsg }, { quoted: m });

        } catch (error) {
            // 6. Manejo de Errores Críticos (Conflictos de Git)
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            
            let errorMsg = `❌ *FALLO EN LA ACTUALIZACIÓN*\n\n`;
            
            if (error.message.includes('local changes to the following files would be overwritten')) {
                errorMsg += `⚠️ *CONFLICTO DETECTADO:* Has modificado archivos localmente que también cambiaron en GitHub.\n\n`;
                errorMsg += `👉 *Solución:* Debes entrar a la consola de Pterodactyl/Termux y usar \`git reset --hard\` o reinstalar el servidor para sincronizar.`;
            } else {
                errorMsg += `*Detalle del error:* \n\`\`\`${error.message}\`\`\``;
            }

            await conn.sendMessage(from, { text: errorMsg }, { quoted: m });
            console.error(chalk.red('[ERROR UPDATE]:'), error);
        }
    }
};

export default updateCommand;