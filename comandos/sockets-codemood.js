import { startMoodBot } from '../sockets/SubMoods/index.js';
import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const cooldowns = new Map();
const databasePath = path.resolve('./jsons/preferencias.json');

const moodCodeCommand = {
    name: 'codemood',
    alias: ['sockets-moods'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        if (m.chat.endsWith('@g.us')) {
            if (await fs.pathExists(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[from]) {
                    const primaryNumber = db[from].replace(/\D/g, '');
                    if (myJid !== primaryNumber) return;
                }
            }
        }

        const tokensPath = path.resolve('./jsons/tokens');
        const inputToken = args[0];
        
        if (!inputToken) {
            return m.reply(`*${config.visuals.emoji2}* Debes proporcionar el token de 4 dígitos.\n\n> Ejemplo: *codemood 1234*`);
        }

        const tokenFile = path.join(tokensPath, `${inputToken}.json`);
        if (!(await fs.pathExists(tokenFile))) {
            return m.reply(`*${config.visuals.emoji2}* Token inválido o ya usado.`);
        }

        const targetNumber = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
        const userSessionPath = path.resolve(`./sesiones_moods/${targetNumber}`);
        
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 30000)) return;

        try {
            await fs.remove(tokenFile);
            
            // LIMPIEZA PREVIA: Si existía una carpeta vieja, se borra para evitar el error de la captura
            if (await fs.pathExists(userSessionPath)) {
                await fs.remove(userSessionPath);
            }

            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`MODO OPERA ACTIVADO\`\n\nPreparando conexión para: \`${targetNumber}\`...\n\n> Generando instancia en el servidor...`,
            }, { quoted: m });

            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startMoodBot(jidReal, conn);

            // ESPERA DE SINCRONIZACIÓN: Baileys necesita tiempo para registrar el socket
            await new Promise(resolve => setTimeout(resolve, 10000));

            // SOLICITUD DEL CÓDIGO
            let code = await sock.requestPairingCode(targetNumber);
            
            if (!code) {
                await fs.remove(userSessionPath);
                throw new Error("WhatsApp rechazó la solicitud. Intenta de nuevo en unos segundos.");
            }

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`VINCULACIÓN DE SUBMOOD\` ✿︎\n\n*❁* \`Pasos:\` \nConfiguración > Dispositivos vinculados > Vincular con número de teléfono.\n\n> Ingresa el código a continuación:`
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* ¡SubMood vinculado correctamente!\n\n> Jerarquía activa para: ${targetNumber}`,
                    }, { quoted: m }); 
                    try {
                        await conn.sendMessage(from, { delete: msgInstrucciones.key });
                        await conn.sendMessage(from, { delete: msgCodigo.key });
                    } catch (e) {}
                }
            });

            cooldowns.set(from, now);

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* \`ERROR DE VINCULACIÓN\`\n\n${err.message}`);
        }
    }
};

export default moodCodeCommand;