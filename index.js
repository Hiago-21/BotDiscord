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

// Evento: Toda vez que alguém mandar uma mensagem no servidor
client.on('messageCreate', (mensagem) => {
    // Regra 1: Ignorar mensagens de outros bots
    if (mensagem.author.bot) return;

    // Regra 2: Verificar se a mensagem é um comando (ex: !ping)
    const prefixo = '!';
    const ehComando = mensagem.content.startsWith(prefixo);

    // Regra 3: Verificar se o bot foi mencionado
    const botFoiMencionado = mensagem.mentions.has(client.user);

    // Se não for nem comando nem menção, o bot ignora a mensagem e para aqui
    if (!ehComando && !botFoiMencionado) return;

    // --- LÓGICA PARA MENÇÃO (Futura IA) ---
    if (botFoiMencionado) {
        // Tira a menção (@BotDaSala) do texto para sobrar só a pergunta da pessoa
        const textoLimpo = mensagem.content.replace(`<@${client.user.id}>`, '').trim();
        
        if (textoLimpo === 'ping') {
            return mensagem.reply('Pong! Você me chamou marcando meu nome.');
        }

        // Resposta padrão se marcarem ele sem ser o comando ping
        return mensagem.reply('Você me chamou? Em breve terei uma IA para te responder direito!');
    }

    // --- LÓGICA PARA COMANDOS (Ex: !ping) ---
    if (ehComando) {
        // Corta o prefixo (!) para ler apenas o nome do comando
        const comando = mensagem.content.slice(prefixo.length).trim().toLowerCase();

        if (comando === 'ping') {
            return mensagem.reply('Pong! Você usou um comando de texto.');
        }
    }
});

// A última linha é o que efetivamente liga o bot usando a chave do .env
client.login(process.env.DISCORD_TOKEN);