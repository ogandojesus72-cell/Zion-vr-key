import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, args }) => {
        const from = m.key.remoteJid;

        // 1. Validar número
        if (!args[0]) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *Número faltante*\n\nUso: *${prefix}code 1849XXXXXXX*\n(Usa el formato internacional sin el +)` 
            }, { quoted: m });
        }

        let targetNumber = args[0].replace(/[^0-9]/g, '');

        // 2. Cooldown
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) {
            const timeLeft = Math.round(((cooldowns.get(from) + 60000) - now) / 1000);
            return await conn.sendMessage(from, { text: `[✿︎] Espera *${timeLeft}s* para solicitar otro código.` });
        }

        // 3. Proceso de Generación
        try {
            // Primer mensaje: Aviso de generación
            const msgEspera = await conn.sendMessage(from, { 
                text: `⏳ *Generando código para el número:* \`${targetNumber}\`...\n\n> Por favor, espera un momento.`,
            }, { quoted: m });

            // Iniciamos la instancia del sub-bot (Igual que en el index principal)
            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            // Solicitamos el código a Baileys (Esto es lo que hace el index al inicio)
            let code = await sock.requestPairingCode(targetNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            // Segundo mensaje: Instrucciones (Con la imagen pequeña del menú)
            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con número de teléfono > ingresa el código.\n\n\`Nota\` » El código es válido por *60 segundos*.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - CONEXIÓN SOCKET',
                        body: `Código generado para: ${targetNumber}`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });

            // Tercer mensaje: El Código puro
            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });

            // Limpiamos el mensaje de "Generando..."
            await conn.sendMessage(from, { delete: msgEspera.key });

            cooldowns.set(from, now);

            // 4. Borrado automático a los 60 segundos
            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error al generar sub-bot:', err);
            await conn.sendMessage(from, { 
                text: `❌ *Error del Sistema*\n\nNo se pudo establecer conexión con Baileys para el número *${targetNumber}*. Intenta nuevamente.` 
            });
        }
    }
};

export default codeCommand;