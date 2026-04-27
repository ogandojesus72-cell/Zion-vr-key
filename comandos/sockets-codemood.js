import { startMoodBot } from '../sockets/SubMoods/index.js';
import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const cooldowns = new Map();
const databasePath = path.resolve('./jsons/preferencias.json');
const ownersFilePath = path.resolve('./config/database/security/authorization/master/owner.json');

const moodCodeCommand = {
    name: 'codemood',
    alias: ['sockets-moods'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        // 1. Obediencia al bot primario
        if (m.chat.endsWith('@g.us')) {
            if (await fs.pathExists(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[from]) {
                    const primaryNumber = db[from].replace(/\D/g, '');
                    if (myJid !== primaryNumber) return;
                }
            }
        }

        // 2. Verificación de autorización (Master JSON)
        if (!(await fs.pathExists(ownersFilePath))) return m.reply("Error: DB Master no encontrada.");
        
        const ownersData = await fs.readJson(ownersFilePath);
        // Extraemos el número limpio de quien escribe (sin @s.whatsapp.net ni @lid)
        const senderRaw = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
        
        const isAuthorized = ownersData.owners.some(num => num.toString().replace(/\D/g, '') === senderRaw);
        if (!isAuthorized) return m.reply("No estás autorizado en el Master JSON.");

        // 3. Validación de Token
        const inputToken = args[0];
        if (!inputToken) return m.reply("Falta el token de 4 dígitos.");

        const tokenFile = path.resolve(`./jsons/tokens/${inputToken}.json`);
        if (!(await fs.pathExists(tokenFile))) return m.reply("Token inválido.");

        // USAMOS EL NÚMERO .NET PARA LA SESIÓN PERO SOLO LOS DÍGITOS PARA EL CÓDIGO
        const targetForCode = "573508941325"; // Tu número real .net sin nada más
        const userSessionPath = path.resolve(`./sesiones_moods/${targetForCode}`);

        try {
            await fs.remove(tokenFile);
            if (await fs.pathExists(userSessionPath)) await fs.remove(userSessionPath);

            const msgEspera = await conn.sendMessage(from, { text: `\`AUTORIZADO\`\nSolicitando código para: ${targetForCode}...` });

            // El JID real para inicializar el socket (con @s.whatsapp.net)
            const jidSocket = `${targetForCode}@s.whatsapp.net`;
            const sock = await startMoodBot(jidSocket, conn);

            // Espera obligatoria para que el socket esté "Ready"
            await new Promise(resolve => setTimeout(resolve, 10000));

            // LA CLAVE: Aquí se manda SOLO el string de números, sin @ ni nada.
            let code = await sock.requestPairingCode(targetForCode);
            
            if (!code) throw new Error("Baileys rechazó la petición. Revisa si el número ya tiene muchas sesiones.");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`CÓDIGO GENERADO\` ✿︎\n\nIngresa el código en tu WhatsApp.\n\n> Válido por 60s.`
            });

            await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', (update) => {
                if (update.connection === 'open') {
                    conn.sendMessage(from, { text: "✅ Mood vinculado con éxito." });
                }
            });

        } catch (err) {
            m.reply(`Error real: ${err.message}`);
        }
    }
};

export default moodCodeCommand;