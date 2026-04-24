import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const voteCommand = {
    name: 'vote',
    alias: ['despedir', 'votar'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje que deseas votar.`);

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            if (!gachaDB[pjId]) return m.reply(`*${config.visuals.emoji2}* El personaje no existe.`);

            const pj = gachaDB[pjId];

            if (pj.owner !== user) {
                return m.reply(`*${config.visuals.emoji2}* ¡No puedes votar a un personaje que no te pertenece!`);
            }

            const pjName = pj.name;

            gachaDB[pjId].status = 'libre';
            delete gachaDB[pjId].owner;

            if (fs.existsSync(shopPath)) {
                let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
                if (shopDB[pjId]) {
                    delete shopDB[pjId];
                    fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
                }
            }

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));

            m.reply(`*${config.visuals.emoji3}* Has votado a *${pjName}*. Ahora es libre y ha sido retirado de cualquier mercado.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar el voto.`);
        }
    }
};

export default voteCommand;
