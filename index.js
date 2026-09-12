// Importa o dotenv para o Node conseguir ler o arquivo .env
require('dotenv').config();

// Importa as classes do discord.js
const { Client, GatewayIntentBits } = require('discord.js');

// Cria o bot e avisa ao Discord o que ele tem permissão para fazer (Intents)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Permite saber em quais servidores ele está
        GatewayIntentBits.GuildMessages,    // Permite ler mensagens em canais de texto
        GatewayIntentBits.MessageContent    // Necessário para ler o conteúdo escrito das mensagens
    ]
});

// Evento: Quando o bot ligar e conectar no Discord, ele roda isso aqui uma vez
client.once('ready', () => {
    console.log(`✅ Sucesso! Bot online e logado como ${client.user.tag}`);
});

// Evento: Toda vez que alguém mandar uma mensagem no servidor, ele roda isso
client.on('messageCreate', (mensagem) => {
    // Regra 1: O bot deve ignorar mensagens de outros bots (inclusive as dele mesmo)
    if (mensagem.author.bot) return;

    // Comando de Teste: Se alguém digitar "ping"
    if (mensagem.content === 'ping') {
        mensagem.reply('Pong!');
    }
});

// A última linha é o que efetivamente liga o bot usando a chave do .env
client.login(process.env.DISCORD_TOKEN);