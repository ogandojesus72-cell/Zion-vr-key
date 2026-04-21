import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, prefix) => {
        const from = m.chat;

        const sessionsPath = path.resolve('./sesiones_subbots');
        if (fs.existsSync(sessionsPath)) {
            const totalSubbots = fs.readdirSync(sessionsPath).length;
            if (totalSubbots >= 75) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2}* \`Límite alcanzado\` *${config.visuals.emoji2}*\n\nLo siento, el sistema solo permite un máximo de *75 subbots* activos.\n\n> ¡Pronto ampliaremos nuestra capacidad!` 
                }, { quoted: m });
            }
        }

        if (!args || !args[0]) {
            return await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`Número faltante\` *${config.visuals.emoji2}*\n\nUso: *${prefix || '#'}code 1849XXXXXXX*\n\n> ¡Ingresa un número válido para comenzar!` 
            }, { quoted: m });
        }

        let targetNumber = args[0].replace(/[^0-9]/g, '');
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`Iniciando proceso\` *${config.visuals.emoji3}*\n\nVinculando a: \`${targetNumber}\`...\n\n> ¡Espera un momento, la magia está ocurriendo!`,
            }, { quoted: m });

            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            await new Promise(resolve => setTimeout(resolve, 3000));

            let code = await sock.requestPairingCode(targetNumber);
            if (!code) throw new Error("No se pudo generar el código");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`VINCULACIÓN DEL SOCKET\` *${config.visuals.emoji3}*\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > Vincular nuevo dispositivo > Vincular con número de teléfono > Ingresa el código.\n\n\`Nota\` » El código es válido por *60 segundos*.\n\n> ¡Ya casi eres parte de la familia!`
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*${config.visuals.emoji3}* \`CONEXIÓN EXITOSA\`\n\nNúmero: ${targetNumber} se ha vinculado correctamente.\n\n> ¡Disfruta del bot y todas sus funciones!`,
                    }, { quoted: m }); 
                }
            });

            cooldowns.set(from, now);

            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error al generar sub-bot:', err);
            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`ERROR DE VINCULACIÓN\`\n\nOcurrió un inconveniente: ${err.message}\n\n> ¡Inténtalo de nuevo, no te rindas!` 
            });
        }
    }
};

export default codeCommand;