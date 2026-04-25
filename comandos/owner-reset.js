import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

// Objeto para guardar la sesión de borrado en memoria
let resetSession = null;

const resetCommand = {
    name: 'borrar',
    alias: ['resetdb'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const folder = args[0];
            let file = args[1];

            // 1. LÓGICA DE CONFIRMACIÓN (Cuando respondes al mensaje)
            if (m.quoted && resetSession && m.text.toLowerCase() === 'reset accept') {
                // Verificar que respondes al mensaje correcto de confirmación
                if (m.quoted.id !== resetSession.msgId) return;

                const { dbPath, fileName, targetData } = resetSession;

                await fs.writeJson(dbPath, targetData, { spaces: 2 });
                
                const successMsg = `*${config.visuals.emoji3} \`RESET EXITOSO\` ${config.visuals.emoji3}*\n\nLa base de datos \`${fileName}.json\` ha sido restaurada.\n\n> El sistema está limpio y listo.`;
                
                await m.reply(successMsg);
                await conn.sendMessage(m.sender, { text: successMsg });

                resetSession = null; // Limpiar sesión
                return;
            }

            // 2. LÓGICA INICIAL (Cuando pones el comando)
            if (!folder || !file) return m.reply(`*${config.visuals.emoji2}* Uso: #borrar <carpeta> <archivo>`);
            
            file = file.replace(/\.json$/i, '');
            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Archivo no encontrado.`);

            // Definir qué datos poner según el archivo
            let initialData = {};
            
            if (file === 'economy') {
                initialData = {
                    "573508941325": {
                        "wallet": 999999999, "bank": 999999999,
                        "daily": { "lastClaim": 0, "streak": 0 },
                        "crime": { "lastUsed": 0 }
                    }
                };
            } else if (file === 'targets') {
                initialData = {
                    "tarjetas": [
                        { "codigo": "KZM-7721-XQ", "cuenta": "ACC-001", "monto": 100000, "usada": false },
                        { "codigo": "KZM-1054-LP", "cuenta": "ACC-002", "monto": 100000, "usada": false },
                        { "codigo": "KZM-8832-ML", "cuenta": "ACC-003", "monto": 100000, "usada": false },
                        { "codigo": "KZM-4490-ZS", "cuenta": "ACC-004", "monto": 100000, "usada": false },
                        { "codigo": "KZM-2210-BK", "cuenta": "ACC-005", "monto": 100000, "usada": false },
                        { "codigo": "KZM-6673-DJ", "cuenta": "ACC-006", "monto": 100000, "usada": false },
                        { "codigo": "KZM-3381-FW", "cuenta": "ACC-007", "monto": 100000, "usada": false },
                        { "codigo": "KZM-9902-GH", "cuenta": "ACC-008", "monto": 100000, "usada": false },
                        { "codigo": "KZM-5517-TY", "cuenta": "ACC-009", "monto": 100000, "usada": false },
                        { "codigo": "KZM-1148-RV", "cuenta": "ACC-010", "monto": 100000, "usada": false }
                    ]
                };
            }

            const confirmMsg = await conn.sendMessage(m.chat, {
                text: `*${config.visuals.emoji3} ¿ESTÁS SEGURO? ${config.visuals.emoji3}*\n\nVas a resetear: \`${file}.json\`\n\nResponde a este mensaje con:\n> *reset accept*\n\n*Nota:* Tienes 5 min o se anulará.`
            }, { quoted: m });

            // Guardar sesión
            resetSession = {
                msgId: confirmMsg.key.id,
                dbPath: dbPath,
                fileName: file,
                targetData: initialData
            };

            // Anulación automática
            setTimeout(async () => {
                if (resetSession && resetSession.msgId === confirmMsg.key.id) {
                    resetSession = null;
                    await conn.sendMessage(m.sender, { text: `*${config.visuals.emoji2}* Tiempo expirado para resetear \`${file}.json\`.` });
                }
            }, 300000);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el comando.`);
        }
    }
};

export default resetCommand;
