// Importa o dotenv para o Node conseguir ler o arquivo .env
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// Mapeia todas as chaves que você tem no .env e qual IA ela pertence
const chavesDisponiveis = [
    { provedor: 'gemini', token: process.env.GEMINI_KEY_1 },
    { provedor: 'gemini', token: process.env.GEMINI_KEY_2 },
    { provedor: 'groq', token: process.env.GROQ_KEY_1 }
].filter(chave => chave.token); // O filter remove automaticamente as chaves que estiverem vazias/undefined

function sortearIA() {
    const indice = Math.floor(Math.random() * chavesDisponiveis.length);
    return chavesDisponiveis[indice];
}

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

    // --- LÓGICA PARA MENÇÃO (IA RESPONDENDO) ---
    if (botFoiMencionado) {
        const textoLimpo = mensagem.content.replace(`<@${client.user.id}>`, '').trim();
        
        if (!textoLimpo) {
            return mensagem.reply('Fala, mestre. Marcou por quê?');
        }

        const iaSorteada = sortearIA();
        
        // Faz o bot mostrar o status "Digitando..." no Discord
        await mensagem.channel.sendTyping();

        try {
            let respostaTexto = '';

            if (iaSorteada.provedor === 'gemini') {
                const genAI = new GoogleGenerativeAI(iaSorteada.token);
                // Usando o flash pois é o modelo gratuito mais rápido
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
                const result = await model.generateContent(textoLimpo);
                respostaTexto = result.response.text();
                
            } else if (iaSorteada.provedor === 'groq') {
                const groq = new Groq({ apiKey: iaSorteada.token });
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: textoLimpo }],
                    model: 'llama3-8b-8192', // Modelo excelente e absurdamente rápido da Groq
                });
                respostaTexto = chatCompletion.choices[0].message.content;
            }

            // O Discord tem limite de 2000 caracteres. Se a IA falar demais, cortamos.
            if (respostaTexto.length > 2000) {
                respostaTexto = respostaTexto.substring(0, 1995) + '...';
            }

            // Responde marcando qual IA foi sorteada (só para vocês acompanharem o teste)
            return mensagem.reply(`*[Respondido via ${iaSorteada.provedor.toUpperCase()}]*\n\n${respostaTexto}`);

        } catch (erro) {
            console.error('Erro na chamada da IA:', erro);
            return mensagem.reply('Deu ruim na API. O servidor do estagiário pegou fogo.');
        }
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