/* KURAYAMI - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC
   Sistema de Procesamiento de Mensajes y Normalización LID
*/

import chalk from 'chalk';
import { config } from './config.js';
import { logger } from './config/print.js';
import { syncLid } from './lid/resolver.js'; // Importamos tu nuevo motor LID

/**
 * Handler principal para procesar mensajes entrantes
 */
export const pixelHandler = async (conn, m) => {
    try {
        if (!m.message) return;
        if (m.key && m.key.remoteJid === 'status@broadcast') return;

        // 1. --- NORMALIZACIÓN DE IDENTIDAD (LID ENGINE) ---
        // Esto traduce los IDs raros de WhatsApp a números de teléfono reales
        m.sender = await syncLid(conn, m, m.chat);

        // 2. Extracción de cuerpo del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 3. Variables de entorno del mensaje
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        // 4. Validaciones de Usuario (Ahora seguras con LID Resolver)
        const isOwner = [conn.user.id.split(':')[0], ...config.ownerNumbers].some(num => m.sender.includes(num));
        const isGroup = m.chat.endsWith('@g.us');
        
        // 5. Registro en consola (Logger)
        logger(m, conn);

        // 6. Ejecución de comandos
        if (isCmd) {
            const cmd = global.commands.get(command) || 
                        Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(command));

            if (cmd) {
                // Validación de permisos
                if (cmd.isOwner && !isOwner) {
                    return m.reply('❌ Este comando es exclusivo para mi desarrollador.');
                }

                if (cmd.isGroup && !isGroup) {
                    return m.reply('❌ Este comando solo puede ser usado en grupos.');
                }

                // Ejecución del comando
                await cmd.run(conn, m, { 
                    prefix, 
                    command, 
                    args, 
                    text, 
                    isOwner, 
                    isGroup 
                });
            }
        }

    } catch (err) {
        console.error(chalk.red('\n[❌] ERROR EN PIXEL HANDLER:'), err);
    }
};