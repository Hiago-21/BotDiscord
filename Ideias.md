# 💡 Ideias e Backlog do Bot (Ideias.md)
Podem dar pull *request* para fazer novas sugestões / implementar as ideias.

## ⚙️ Infraestrutura Básica
- [x] Criar repositório no GitHub com `.gitignore` e `README.md`
- [x] Estruturar o projeto base com Node.js e `discord.js`
- [ ] Criar a API do bot em: https://discord.com/developers/applications
- [ ] Configurar arquivo `.env` para esconder variáveis de ambiente
- [ ] Criar servidor Express com rota `GET /ping` (Anti-sleep para o Render)
- [ ] Conectar projeto ao banco de dados (Supabase)
- [ ] Implementar a função de Rotação de API Keys (Load Balancer) para as contas da IA

## 🤖 Integração com IA (Gemini/Groq/Outro)
- [ ] Criar o evento para o bot ler mensagens com `@BotDaSala`
- [ ] Configurar o *Prompt* de Sistema (Personalidade do Bot)
- [ ] Criar comando `/resumo`: Bot lê o histórico recente do chat e a IA cria um TL;DR do caos
- [ ] Criar comando `/socorro`: IA analisa um bloco de código enviado e aponta o erro

## 🗣️ Utilitários para Canais de Voz
- [ ] **Salas Dinâmicas:** Bot escuta o canal "➕ Criar Sala", cria um canal de voz temporário e deleta assim que esvaziar
- [ ] Criar comando `/pomodoro [foco] [pausa]`: Mutar e desmutar usuários da sala de voz automaticamente
- [ ] **Polícia da Postura:** Bot entra na call silenciosamente após 2h, toca um áudio de "Beba água e arrume a postura" e desconecta

## 🕹️ Gamificação e Código
- [ ] Configurar Webhooks do GitHub para disparar mensagens no canal `#commits`
- [ ] **Job de Domingo:** Script que puxa dados do WakaTime e envia o Pódio da Semana no chat geral
- [ ] **Job de Segunda:** Script que envia automaticamente um desafio do LeetCode/HackerRank
- [ ] Criar comando `/ranking`: Mostra o *leaderboard* do WakaTime sob demanda

## 🏫 Sobrevivência Universitária e Humor
- [ ] Criar comando `/perola add ["frase"] [@autor]`: Salvar citação no Supabase
- [ ] Criar comando `/perola ler`: Puxar e exibir uma frase aleatória do Supabase
- [ ] Criar comando `/desespero [notas]`: Calcular nota necessária na prova final para não reprovar
- [ ] Criar comando `/desculpa`: Bot consome uma API para dar uma desculpa técnica aleatória para um bug
- [ ] **Bingo da Aula:** Gerar uma cartela (imagem ou texto) com frases clichês dos professores
- [ ] **Cardápio do RU:** Script de *web scraping* que roda toda manhã para avisar o cardápio da merenda