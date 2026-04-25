import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const resetCommand = {
    name: 'borrar',
    alias: ['resetdb', 'clearout'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const folder = args[0];
            let file = args[1];

            if (!folder || !file) {
                return m.reply(`*${config.visuals.emoji2}* Uso: #borrar <carpeta> <archivo>`);
            }

            file = file.replace(/\.json$/i, '');
            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* El archivo \`${file}.json\` no existe.`);
            }

            let initialData = {};

            if (file === 'economy') {
                initialData = {
                    "573508941325": {
                        "wallet": 999999999,
                        "bank": 999999999,
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
            } else {
                // Si es cualquier otro archivo, se resetea como un objeto vacío por seguridad
                initialData = {};
            }

            await fs.writeJson(dbPath, initialData, { spaces: 2 });

            const successMsg = `*${config.visuals.emoji3} \`RESET EXITOSO\` ${config.visuals.emoji3}*\n\nBase de datos \`${file}.json\` restaurada a valores de fábrica.`;
            
            await m.reply(successMsg);
            await conn.sendMessage(m.sender, { text: successMsg });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error crítico al intentar resetear.`);
        }
    }
};

export default resetCommand;