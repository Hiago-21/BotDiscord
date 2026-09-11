# 🤖 Bot da Turma (Nome Provisório)

Bem-vindos ao repositório oficial do nosso bot do Discord! 
A ideia deste projeto é principalmente exercitar o trabalho em equipe de maneira divertida
Projeto 100% *Open Source* feito por e para a nossa sala. 

Qualquer pessoa pode abrir um *Pull Request* para adicionar funcionalidades, testar integrações e usar o projeto como *case* real no portfólio.

## 🛠️ Stack Tecnológica (Custo Zero)
Toda a infraestrutura foi pensada para rodar de graça:
* **Linguagem/Framework:** Node.js com a biblioteca `discord.js`.
* **Hospedagem:** Render (Plano Free) + UptimeRobot (para dar um ping a cada 10 min e não deixar o servidor dormir).
* **Banco de Dados:** Supabase (PostgreSQL) para salvar ranking, usuários e histórico.
* **Inteligência Artificial:** APIs gratuitas (possívelmente Google Gemini ou Groq).

## 🚀 Funcionalidades Planejadas (Backlog)

### 1. Mascote IA & Rotação de Chaves (Load Balancing)
O bot terá uma IA integrada respondendo diretamente no chat, configurada com um *prompt* de personalidade (Ainda a ser discutido qual personalidade).
* **Como manter a IA de graça:** Vamos implementar um sistema de **API Key Rotation**. Os alunos que quiserem podem gerar chaves gratuitas nas suas contas do AGENTE DE IA e fornecer para o bot. O código vai sortear (`Math.random()`) uma das chaves disponíveis a cada requisição para não estourar o limite de ninguém.
* **Recompensa:** Quem doar uma API Key recebe o cargo exclusivo de `Patrocinador` no servidor e limite "infinito" de gasto de tokens da IA.

### 2. Gamificação com WakaTime
Sistema focado em incentivar a prática de programação.
* O bot fará requisições na API do WakaTime.
* Todo domingo, um *Cron Job* publica no chat geral o **Pódio da Semana**: quem codou mais horas, dividindo as estatísticas por linguagens utilizadas.

### 3. Utilitários para Chamada de Voz
* **`/perola "frase"`:** Comando para registrar no banco de dados (Supabase) frases absurdas ditas de madrugada nas *calls*. O bot salva quem disse e a data. Ao digitar `/perola` sem parâmetros, ele resgata uma pérola aleatória do passado.
* **Salas Dinâmicas:** Um canal fixo chamado "➕ Criar Sala". Ao entrar, o bot gera uma sala de voz temporária para o usuário, que é excluída automaticamente quando todos saem.

## 🔐 Regra de Segurança Crítica
**NUNCA dê commit nas suas API Keys ou senhas do banco de dados.**
Todas as credenciais devem ser acessadas via `process.env`. Para rodar localmente, crie um arquivo `.env` na raiz do seu projeto (ele já está ignorado no `.gitignore`).

## 🤝 Como Contribuir
1. Faça um *Fork* deste repositório.
2. Crie uma *Branch* para a sua *feature* (`git checkout -b feature/minha-ideia-genial`).
3. Codifique, teste e faça o *Commit* (`git commit -m "Feat: Adiciona comando X"`).
4. Dê o *Push* para a sua *Branch* (`git push origin feature/minha-ideia-genial`).
5. Abra um **Pull Request** aqui no repositório principal!

Sinta-se livre para pegar qualquer ideia do backlog acima ou sugerir a sua própria.