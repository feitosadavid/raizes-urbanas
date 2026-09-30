# 🌱 Raízes Urbanas

Site institucional de uma ONG fictícia dedicada a hortas comunitárias, segurança
alimentar e capacitação em agroecologia na cidade de São Paulo. Projeto acadêmico
desenvolvido com HTML5 semântico, CSS Grid/Flexbox e JavaScript puro (Vanilla JS),
com um pequeno backend em Node.js para persistência real dos dados.

> ⚠️ **Protótipo para fins de demonstração/estudo.** Os dados da ONG (endereço,
> CNPJ, números de atendimento) são fictícios, e as validações de CPF/CEP foram
> deliberadamente flexibilizadas para facilitar testes — veja a seção
> [Validações do formulário](#-validações-do-formulário).

---

## ✨ Funcionalidades

- **Arquitetura multi-página (MPA)** com três páginas semânticas: início, projetos
  e cadastro de voluntários.
- **Menu de navegação responsivo**: dropdown por hover/foco em telas largas,
  colapsa para um botão hambúrguer acessível (`aria-expanded`) em telas estreitas.
- **Formulário de cadastro completo**, com:
  - Máscaras de entrada em tempo real para CPF, telefone, CEP e data de nascimento;
  - Validação nativa (HTML5) combinada com validação customizada em JavaScript;
  - Preenchimento automático de endereço via API pública [ViaCEP](https://viacep.com.br/);
  - Mensagens de erro acessíveis, inline e num resumo com links de retorno ao campo;
  - **Rascunho automático em `localStorage`**: o que foi digitado é salvo enquanto
    a pessoa preenche e restaurado se a página for recarregada, sendo limpo
    automaticamente após um envio confirmado.
- **Backend em Node.js sem dependências externas** (`http`, `fs`, `path` puros),
  servindo os arquivos estáticos e persistindo os cadastros em um arquivo JSON,
  com data/hora registrada no fuso de São Paulo (`-03:00`).
- **Prova de conceito de SPA** (`spa-demo.html`): navegação por rota via `hash`,
  sem recarregar a página, com conteúdo gerado por templates em JavaScript.
- **Layout responsivo** construído com CSS Grid (estrutura de 12 colunas) e
  Flexbox (alinhamento interno dos componentes).

---

## 🧱 Stack tecnológica

| Camada         | Tecnologia                                            |
| -------------- | ----------------------------------------------------- |
| Marcação       | HTML5 semântico                                       |
| Estilo         | CSS3 (Grid, Flexbox, variáveis CSS, media queries)    |
| Interatividade | JavaScript (Vanilla JS, sem frameworks)               |
| Servidor       | Node.js (módulos nativos, sem `npm install`)          |
| Persistência   | Arquivo JSON (`data/cadastros.json`)                  |
| Tipografia     | Google Fonts — Fraunces (títulos) + Work Sans (texto) |
| API externa    | ViaCEP (consulta pública de endereço por CEP)         |

---

## 📁 Estrutura de diretórios

```
raizes-urbanas/
├── index.html          # Página inicial — apresentação da ONG
├── projetos.html        # Iniciativas solidárias
├── cadastro.html         # Formulário de cadastro de voluntários
├── spa-demo.html          # Prova de conceito de SPA (rotas por hash)
├── server.js               # Servidor Node — arquivos estáticos + API de cadastro
├── package.json             # Scripts de inicialização, checagem e testes
├── render.yaml              # Configuração de deploy no Render
├── .github/workflows/ci.yml # CI em push e pull request
├── css/
│   └── style.css             # Estilos, tokens de design, grid e breakpoints
├── js/
│   ├── main.js                 # Menu mobile (hambúrguer)
│   ├── mascaras.js               # Máscaras de CPF, telefone, CEP e data
│   ├── validacao.js               # Validação e envio do formulário
│   ├── rascunho.js                 # Rascunho do formulário em localStorage
│   └── spa-router.js                 # Roteador da demo de SPA
└── data/
    └── cadastros.json                  # "Banco de dados" — cadastros persistidos
```

---

## 🚀 Como rodar o projeto

**Pré-requisito:** ter o [Node.js](https://nodejs.org/) instalado (qualquer versão
LTS recente).

```bash
# 1. Entre na pasta do projeto
cd raizes-urbanas

# 2. Instale as dependências (o projeto usa apenas módulos nativos)
npm install

# 3. Rode o servidor
npm start
```

No Windows, se o PowerShell bloquear `npm.ps1` por causa da política de
execução, use os comandos equivalentes abaixo:

```powershell
npm.cmd install
npm.cmd start
```

Você verá no terminal:

```
Raízes Urbanas rodando em http://localhost:3000
Cadastros salvos em: .../raizes-urbanas/data/cadastros.json
```

Abra **http://localhost:3000** no navegador. Não abra os arquivos `.html`
diretamente (`file://`) nem use extensões como _Live Server_ — o formulário
depende do backend Node para funcionar corretamente.

### Verificação local

```bash
npm run check
npm test
```

O projeto usa o test runner nativo do Node.js e não exige dependências de runtime.
Os testes também verificam a estrutura acessível básica das páginas, incluindo
`lang`, `title`, `main`, skip link, ausência de estilos inline e labels de campos.
Em Windows com a política do PowerShell restrita, use `npm.cmd run check` e
`npm.cmd test`. As variáveis opcionais estão em `.env.example`: `PORT`, `HOST`
e `ADMIN_TOKEN`.

---

## 🔌 Rotas do servidor

| Método | Rota                              | Descrição                                                                               |
| ------ | --------------------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/`, `/*.html`, `/css/*`, `/js/*` | Arquivos estáticos do site                                                              |
| POST   | `/api/cadastro`                   | Recebe um cadastro em JSON, valida campos obrigatórios e grava em `data/cadastros.json` |
| GET    | `/api/cadastros`                  | Lista cadastros somente com o header `x-admin-token` correspondente a `ADMIN_TOKEN`     |

---

## ✅ Validações do formulário

| Campo              | Regra aplicada                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome               | Obrigatório, mínimo 3 caracteres                                                                                                                   |
| E-mail             | Obrigatório, formato de e-mail válido (`type="email"`)                                                                                             |
| CPF                | Obrigatório, precisa seguir o formato `000.000.000-00` — **sem** verificação de dígito, propositalmente, para facilitar testes com dados fictícios |
| Telefone           | Obrigatório, formato `(00) 0000-0000` ou `(00) 00000-0000`                                                                                         |
| Data de nascimento | Obrigatória, precisa ser uma data real de calendário (considera anos bissextos) e a pessoa precisa ter **16 anos ou mais**                         |
| CEP                | Obrigatório, formato `00000-000`; busca automática de endereço via ViaCEP (se o CEP não existir, não bloqueia — a pessoa preenche manualmente)     |
| Interesses         | Pelo menos uma área marcada                                                                                                                        |
| Disponibilidade    | Obrigatório selecionar um período                                                                                                                  |
| Termo de aceite    | Checkbox obrigatório                                                                                                                               |

Falhas de rede (ex.: servidor Node fora do ar) são tratadas com uma mensagem
clara, sem travar o formulário.

As regras essenciais são repetidas no servidor: formato, limites, idade, endereço,
interesses, disponibilidade e aceite do termo. O servidor também limita o corpo
JSON, restringe os arquivos públicos, envia headers básicos de segurança e cache,
comprime assets compatíveis com gzip e suporta `ETag`/respostas `304`.

## ♿ Acessibilidade

O projeto segue uma verificação prática baseada nas áreas relevantes da WCAG 2.1:

- HTML semântico, landmarks, headings e `lang="pt-BR"`;
- link para saltar ao conteúdo principal;
- labels associados aos campos e mensagens por `aria-describedby`;
- `aria-invalid` atualizado durante a validação;
- resumo de erros focável e painel de sucesso anunciado por `aria-live`;
- navegação por teclado com indicador de foco visível;
- menu responsivo com `aria-expanded`;
- suporte a `prefers-reduced-motion`.

A conformidade formal ainda depende de auditoria manual com teclado, zoom de 200%,
contraste e leitor de tela, além de uma ferramenta como Lighthouse, axe ou WAVE.

## 🔀 Fluxo Git e colaboração

O repositório segue GitFlow com estas branches:

- `main`: representa apenas versões de lançamento estáveis e deve receber alterações por pull request.
- `develop`: branch permanente de integração do desenvolvimento contínuo; recebe funcionalidades concluídas e prepara a próxima versão.
- `feature/<nome>`: branch temporária criada a partir de `develop` para uma funcionalidade ou melhoria isolada. O trabalho atual está em `feature/production-accessibility`.
- `hotfix/<nome>`: branch temporária criada a partir de `main` para corrigir falhas urgentes em produção. Depois da correção, deve ser integrada em `main` e também em `develop`.
- `release/<versão>`: branch opcional criada a partir de `develop` para congelar uma versão, executar testes finais e preparar o lançamento em `main`.

O fluxo normal é `feature/*` → `develop` → `release/*` → `main`. Um lançamento
deve ser marcado com uma tag, como `v1.0.0`, e sincronizado novamente em `develop`.
Correções urgentes seguem `hotfix/*` → `main` e depois `hotfix/*` → `develop`.

1. Crie uma branch descritiva a partir de `develop`.
2. Faça commits pequenos e objetivos usando verbos no presente.
3. Abra um pull request da `feature/*` para `develop` com testes e impacto de acessibilidade.
4. Aguarde o GitHub Actions e pelo menos uma revisão antes do merge.
5. Crie `release/*` quando o conjunto de funcionalidades estiver pronto para validação final.
6. Faça merge em `main`, crie a tag e sincronize a versão em `develop`.

O workflow em `.github/workflows/ci.yml` executa checagem de sintaxe e testes em
pushes para `main` e em pull requests.

---

## 📐 Responsividade

O layout usa CSS Grid para a estrutura macro das páginas e Flexbox para o
alinhamento interno dos componentes (cabeçalho, botões, campos do formulário).
Dois breakpoints principais controlam a adaptação entre dispositivos:

- **`max-width: 40rem` (640px)** — colapsa grades de múltiplas colunas (ex.:
  indicadores numéricos) para uma coluna única.
- **`max-width: 44rem` (704px)** — ativa o menu hambúrguer, empilha o
  cabeçalho/rodapé e colapsa o submenu dropdown para lista simples.

O site também respeita `prefers-reduced-motion`, desativando transições e
animações para quem configurou essa preferência no sistema.

---

## 🧪 Demonstração de SPA

A página [`spa-demo.html`](./spa-demo.html) é uma prova de conceito isolada do
site principal, demonstrando o mecanismo de **Single Page Application**:

- Um único documento HTML com um contêiner de conteúdo (`#app-spa`);
- Três rotas (`#/inicio`, `#/projetos`, `#/contato`) trocadas via evento
  `hashchange`, sem recarregar a página;
- Conteúdo gerado por **templates em JavaScript** (Template Literals),
  incluindo uma lista de projetos renderizada dinamicamente com `.map()`.

O site principal continua sendo multi-página (MPA) por escolha deliberada —
mais adequado para conteúdo institucional com SEO e URLs semânticas — sendo a
SPA apenas uma demonstração técnica complementar.

---

## 💾 Rascunho automático (localStorage)

Ao preencher `cadastro.html`, o formulário salva seu progresso automaticamente
no `localStorage` do navegador (com um pequeno atraso de digitação). Se a
página for recarregada por engano, os dados são restaurados e um aviso é
exibido, com opção de descartar o rascunho manualmente. Ao concluir o cadastro
com sucesso, o rascunho é apagado automaticamente.

---

## 📄 Exemplo de registro salvo

```json
{
  "protocolo": "RU-2026-661285",
  "nome": "Ana Souza",
  "email": "ana@example.com",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "nascimento": "15/03/1990",
  "endereco": {
    "cep": "05435-060",
    "logradouro": "Rua Harmonia",
    "numero": "100",
    "bairro": "Vila Madalena",
    "cidade": "São Paulo",
    "uf": "SP"
  },
  "interesses": ["Hortas comunitárias"],
  "disponibilidade": "Manhã",
  "recebidoEm": "2026-09-08T20:00:56-03:00"
}
```

---

## 🚀 Deploy

O arquivo `render.yaml` prepara um Web Service no Render:

1. Crie um serviço a partir do repositório GitHub.
2. Use o blueprint `render.yaml` ou configure `npm install` como build e `npm start` como start.
3. Defina `ADMIN_TOKEN` como segredo no painel do provedor.
4. Verifique a rota `/` e o fluxo completo do formulário após o deploy.

O deploy real depende de uma conta e credenciais do provedor; elas não ficam
armazenadas no repositório.

## 🛠️ Manutenção e limitações conhecidas

- Persistência em arquivo JSON local — não é um banco de dados real; sob uso
  concorrente intenso pode haver condição de corrida na escrita.
- O endpoint `/api/cadastros` fica indisponível sem `ADMIN_TOKEN` e deve ser
  substituído por uma solução administrativa autenticada em produção.
- CPF armazenado em texto puro, sem verificação de dígito (aceita qualquer
  valor no formato correto).
- Faça backup de `data/cadastros.json` antes de atualizações e não versionalize
  dados reais de voluntários.
- Para maior escala, migre a persistência para SQLite ou outro banco com controle
  de concorrência, criptografia e política de retenção.

---

## 📜 Licença

Projeto acadêmico/protótipo, sem licença comercial associada. Livre para uso
educacional e estudo.
