// Importa o dotenv para o Node conseguir ler o arquivo .env
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

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
client.once('clientReady', () => {
    console.log(`✅ Sucesso! Bot online e logado como ${client.user.tag}`);
});

// Evento: Toda vez que alguém mandar uma mensagem no servidor
client.on('messageCreate', async (mensagem) => {
    // Regra 1: Ignorar mensagens de outros bots
    if (mensagem.author.bot) return;

    // Regra 2: Verificar se a mensagem é um comando (ex: !ping)
    const prefixo = '!';
    const ehComando = mensagem.content.startsWith(prefixo);

    // Regra 3: Verificar se o bot foi mencionado
    const botFoiMencionado = mensagem.mentions.has(client.user);

    // Se não for nem comando nem menção, o bot ignora a mensagem e para aqui
    if (!ehComando && !botFoiMencionado) return;

    // --- LÓGICA PARA MENÇÃO (A IA RESPONDENDO COM CONTEXTO) ---
    if (botFoiMencionado) {
        const textoLimpo = mensagem.content.replace(`<@${client.user.id}>`, '').trim();
        
        if (!textoLimpo) {
            return mensagem.reply('Fala, mestre. Marcou por quê?');
        }

        // 1. Faz o bot mostrar "Digitando..." enquanto processa
        await mensagem.channel.sendTyping();

        // 2. Puxa as últimas 6 mensagens do canal para criar a memória
        const historicoDiscord = await mensagem.channel.messages.fetch({ limit: 6 });
        
        // O Discord entrega as mensagens da mais nova para a mais velha. Vamos inverter a ordem.
        const mensagensOrdenadas = Array.from(historicoDiscord.values()).reverse();

        // 3. Monta um "roteiro" para a IA ler
        let roteiroChat = "Abaixo está o histórico recente da conversa no Discord:\n\n";
        
        mensagensOrdenadas.forEach((msg) => {
            // Ignora comandos com "!" para não sujar o contexto
            if (msg.content.startsWith('!')) return; 

            const nomeAutor = msg.author.username;
            const falaLimpa = msg.content.replace(`<@${client.user.id}>`, '').trim();
            
            if (falaLimpa) {
                roteiroChat += `[${nomeAutor}]: ${falaLimpa}\n`;
            }
        });

        // 4. Junta as instruções de personalidade com o histórico
        const promptFinal = `
Você é o bot da nossa turma de Ciência da Computação.
Use o histórico abaixo para entender o contexto. Responda de forma direta à última mensagem.

${roteiroChat}
`;

        const iaSorteada = sortearIA();

        try {
            let respostaTexto = '';

            if (iaSorteada.provedor === 'gemini') {
                const genAI = new GoogleGenerativeAI(iaSorteada.token);
                const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' }); 
                // Envia o prompt turbinado com o histórico
                const result = await model.generateContent(promptFinal);
                respostaTexto = result.response.text();
                
            } else if (iaSorteada.provedor === 'groq') {
                // Usa o cliente da OpenAI, mas aponta para o servidor da Groq
                const groq = new OpenAI({
                    baseURL: 'https://api.groq.com/openai/v1',
                    apiKey: iaSorteada.token,
                });
                
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: promptFinal },
                        { role: 'user', content: textoLimpo }
                    ],
                    model: 'openai/gpt-oss-20b', // O modelo ultrarrápido validado na sua pesquisa
                });
                
                respostaTexto = chatCompletion.choices[0].message.content;
            }

            if (respostaTexto.length > 2000) {
                respostaTexto = respostaTexto.substring(0, 1995) + '...';
            }

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