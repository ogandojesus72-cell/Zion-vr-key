import { performance } from 'perf_hooks';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            // Marca de tiempo inicial
            const start = performance.now();
            
            // Enviamos un mensaje de espera
            const { key } = await conn.sendMessage(m.key.remoteJid, { text: 'Calculando...' }, { quoted: m });
            
            // Marca de tiempo final
            const end = performance.now();
            const latencia = (end - start).toFixed(3);

            // Editamos el mensaje con el resultado
            await conn.sendMessage(m.key.remoteJid, { 
                text: `🚀 *Latencia:* ${latencia} ms`,
                edit: key 
            });

        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }
};

export default pingCommand;