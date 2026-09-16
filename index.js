// Importa o dotenv para o Node conseguir ler o arquivo .env
require('dotenv').config();

const express = require('express');
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
Você é o "FuleraBot", o bot mascote do servidor do Discord da nossa turma de Ciência da Computação.

SUA PERSONALIDADE:
- Você é uma IA sarcástica, caótica e autoconsciente. Você brinca constantemente com o fato de ser um bot (fala sobre sua falta de GPU, problemas de cache, que roda em um servidor movido a hamster, etc).
- Você adora fazer piadas com programação, zoar bugs e dar respostas irônicas, MAS a sua regra de ouro é: a zoeira NUNCA pode atrapalhar a ajuda. Você sempre entrega a solução técnica perfeita no final.
- Você fala de igual para igual com a galera. Usa gírias atuais da internet e de TI ("tankar", "ir de arrasta pra cima", "gambiarra", "F no chat").
- Se alguém mandar um código quebrado, dê uma zoada amigável no erro antes de cuspir o código corrigido.

REGRAS DE RESPOSTA:
- Seja curto e direto. Textão no Discord é crime inafiançável.
- Responda no idioma e no tom da mensagem do usuário.

Abaixo está o histórico recente da conversa no canal para você ter contexto. Responda diretamente à última mensagem de forma natural, encarnando seu personagem:

${roteiroChat}
`;

        // --- ROTEAMENTO INTELIGENTE ---
        let iaSorteada;
        const temImagem = mensagem.attachments.size > 0;

        if (temImagem) {
            // Se tem imagem, força o uso do Gemini
            iaSorteada = chavesDisponiveis.find(c => c.provedor === 'gemini');
            if (!iaSorteada) return mensagem.reply('Tô sem chave do Gemini pra conseguir ler essa imagem, mestre.');
        } else {
            // Se for só texto, sorteia normalmente
            iaSorteada = sortearIA();
        }

        // Faz o bot mostrar o status "Digitando..." no Discord
        await mensagem.channel.sendTyping();

        try {
            let respostaTexto = '';

            if (iaSorteada.provedor === 'gemini') {
                const genAI = new GoogleGenerativeAI(iaSorteada.token);
                const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' }); 
                
                // Prepara o array de conteúdo. Começa com o texto da conversa.
                const conteudoParaIA = [promptFinal];

                // Se tiver imagem, baixa do Discord e converte para o formato que o Google aceita (Base64)
                if (temImagem) {
                    for (const [id, anexo] of mensagem.attachments) {
                        if (anexo.contentType && anexo.contentType.startsWith('image/')) {
                            // Baixa a imagem da URL do Discord
                            const response = await fetch(anexo.url);
                            const arrayBuffer = await response.arrayBuffer();
                            const bufferBase64 = Buffer.from(arrayBuffer).toString('base64');
                            
                            // Adiciona a imagem no pacote que vai para a IA
                            conteudoParaIA.push({
                                inlineData: {
                                    data: bufferBase64,
                                    mimeType: anexo.contentType
                                }
                            });
                        }
                    }
                }

                // Envia o pacote completo (Texto + Imagens se houverem)
                const result = await model.generateContent(conteudoParaIA);
                respostaTexto = result.response.text();
                
            } else if (iaSorteada.provedor === 'groq') {
                // A Groq continua igual, lidando só com texto ultrarrápido
                const groq = new OpenAI({
                    baseURL: 'https://api.groq.com/openai/v1',
                    apiKey: iaSorteada.token,
                });
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: promptFinal },
                        { role: 'user', content: textoLimpo }
                    ],
                    model: 'openai/gpt-oss-20b', 
                });
                respostaTexto = chatCompletion.choices[0].message.content;
            }

            // O Discord tem limite de 2000 caracteres
            if (respostaTexto.length > 2000) {
                respostaTexto = respostaTexto.substring(0, 1995) + '...';
            }

            return mensagem.reply(`*[Respondido via ${iaSorteada.provedor.toUpperCase()}]*\n\n${respostaTexto}`);

        } catch (erro) {
            console.error('Erro na chamada da IA:', erro);
            return mensagem.reply('Deu ruim na API. O servidor do estagiário pegou fogo.');
        }    }

    // --- LÓGICA PARA COMANDOS (Ex: !ping, !imaginar) ---
    if (ehComando) {
        const comando = mensagem.content.slice(prefixo.length).trim().toLowerCase();

        if (comando === 'ping') {
            return mensagem.reply('Pong! Você usou um comando de texto.');
        }

        // NOVO COMANDO: !imaginar [o que você quer]
        if (comando.startsWith('imaginar ')) {
            // Pega tudo que o usuário digitou depois de "!imaginar "
            const promptImagem = mensagem.content.slice(prefixo.length + 9).trim();

            if (!promptImagem) {
                return mensagem.reply('Você precisa me dizer o que desenhar! Ex: `!imaginar um cachorro caramelo programando no VS Code`');
            }

            // Mostra "Digitando..." para a galera saber que o bot está pensando
            await mensagem.channel.sendTyping();

            try {
                const chaveGroq = chavesDisponiveis.find(c => c.provedor === 'groq');
                
                if (!chaveGroq) {
                    return mensagem.reply('Tô sem a chave do Groq pra traduzir isso aí. O estagiário deve ter apagado do .env!');
                }

                const groq = new OpenAI({
                    baseURL: 'https://api.groq.com/openai/v1',
                    apiKey: chaveGroq.token,
                });

                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        { 
                            role: 'system', 
                            content: `Você é um tradutor especializado em criar prompts para IA de imagens.
                            Sua missão é interpretar o pedido do usuário e criar o melhor prompt visual em INGLÊS.
                            
                            REGRAS OBRIGATÓRIAS:
                            1. Corrija erros de digitação ANTES de traduzir (ex: "ramister" = hamster, "mause" = mouse).
                            2. TRADUZA O SENTIDO, NÃO A PALAVRA! Se o usuário usar gírias do Brasil, adapte. "Fazer joia" ou "dar joia" significa "thumbs up" (sinal de positivo com o polegar), e NÃO "jewelry" (joias). "Jogo da velha" é "tic-tac-toe board game".
                            3. Sempre adicione termos para melhorar a arte visual no final (ex: high quality, highly detailed, 4k, masterpiece, cinematic lighting, sharp focus).
                            4. Responda APENAS com o prompt final em inglês, sem conversinha.` 
                        },
                        { role: 'user', content: promptImagem }
                    ],
                    model: 'openai/gpt-oss-20b',
                });

                const promptEmIngles = chatCompletion.choices[0].message.content.trim();
                
                console.log(`Original: ${promptImagem} | Traduzido: ${promptEmIngles}`);

                const promptFormatado = encodeURIComponent(promptEmIngles);
                
                const urlImagem = `https://image.pollinations.ai/prompt/${promptFormatado}?width=1024&height=1024&nologo=true&model=flux`;

                return mensagem.reply({
                    content: `🎨 **Pedido:** "${promptImagem}"\n*(Prompt otimizado pelo bot: ${promptEmIngles})*`,
                    files: [{
                        attachment: urlImagem,
                        name: 'imagem_gerada.png'
                    }]
                });

            } catch (erro) {
                // ESTE É O CATCH QUE ESTAVA FALTANDO!
                console.error('Erro ao gerar imagem:', erro);
                return mensagem.reply('O estagiário de design tropeçou no cabo do servidor. Tente de novo!');
            }
        }
    }
});

// A última linha é o que efetivamente liga o bot usando a chave do .env
client.login(process.env.DISCORD_TOKEN);

// --- SISTEMA ANTI-SLEEP (SERVIDOR WEB) ---
const app = express();
// O Render define a porta automaticamente, ou usa a 3000 no seu PC
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    res.send('O FuleraBot está online, tomando café e julgando seu código.');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web rodando na porta ${PORT}`);
});