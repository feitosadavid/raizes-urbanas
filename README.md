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

| Camada       | Tecnologia                                   |
|--------------|-----------------------------------------------|
| Marcação     | HTML5 semântico                                |
| Estilo       | CSS3 (Grid, Flexbox, variáveis CSS, media queries) |
| Interatividade | JavaScript (Vanilla JS, sem frameworks)      |
| Servidor     | Node.js (módulos nativos, sem `npm install`)  |
| Persistência | Arquivo JSON (`data/cadastros.json`)          |
| Tipografia   | Google Fonts — Fraunces (títulos) + Work Sans (texto) |
| API externa  | ViaCEP (consulta pública de endereço por CEP) |

---

## 📁 Estrutura de diretórios

```
raizes-urbanas/
├── index.html          # Página inicial — apresentação da ONG
├── projetos.html        # Iniciativas solidárias
├── cadastro.html         # Formulário de cadastro de voluntários
├── spa-demo.html          # Prova de conceito de SPA (rotas por hash)
├── server.js               # Servidor Node — arquivos estáticos + API de cadastro
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

# 2. Rode o servidor
node server.js
```

Você verá no terminal:

```
Raízes Urbanas rodando em http://localhost:3000
Cadastros salvos em: .../raizes-urbanas/data/cadastros.json
```

Abra **http://localhost:3000** no navegador. Não abra os arquivos `.html`
diretamente (`file://`) nem use extensões como *Live Server* — o formulário
depende do backend Node para funcionar corretamente.

---

## 🔌 Rotas do servidor

| Método | Rota              | Descrição                                                        |
|--------|-------------------|--------------------------------------------------------------------|
| GET    | `/`, `/*.html`, `/css/*`, `/js/*` | Arquivos estáticos do site                            |
| POST   | `/api/cadastro`   | Recebe um cadastro em JSON, valida campos obrigatórios e grava em `data/cadastros.json` |
| GET    | `/api/cadastros`  | Lista todos os cadastros salvos (sem autenticação — apenas para inspeção no protótipo) |

---

## ✅ Validações do formulário

| Campo             | Regra aplicada                                                                 |
|-------------------|----------------------------------------------------------------------------------|
| Nome              | Obrigatório, mínimo 3 caracteres                                                  |
| E-mail            | Obrigatório, formato de e-mail válido (`type="email"`)                            |
| CPF               | Obrigatório, precisa seguir o formato `000.000.000-00` — **sem** verificação de dígito, propositalmente, para facilitar testes com dados fictícios |
| Telefone          | Obrigatório, formato `(00) 0000-0000` ou `(00) 00000-0000`                         |
| Data de nascimento | Obrigatória, precisa ser uma data real de calendário (considera anos bissextos) e a pessoa precisa ter **16 anos ou mais** |
| CEP               | Obrigatório, formato `00000-000`; busca automática de endereço via ViaCEP (se o CEP não existir, não bloqueia — a pessoa preenche manualmente) |
| Interesses        | Pelo menos uma área marcada                                                        |
| Disponibilidade   | Obrigatório selecionar um período                                                  |
| Termo de aceite   | Checkbox obrigatório                                                               |

Falhas de rede (ex.: servidor Node fora do ar) são tratadas com uma mensagem
clara, sem travar o formulário.

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

## ⚠️ Limitações conhecidas

- Persistência em arquivo JSON local — não é um banco de dados real; sob uso
  concorrente intenso pode haver condição de corrida na escrita.
- Endpoint `/api/cadastros` não possui autenticação — serve apenas para
  inspeção durante o desenvolvimento.
- CPF armazenado em texto puro, sem verificação de dígito (aceita qualquer
  valor no formato correto).

## 🔭 Próximos passos

- Separar mais claramente a camada de validação da camada de chamadas de rede
  em `validacao.js`.
- Migrar os scripts para módulos ES6 (`import`/`export`).
- Adicionar componentes de feedback visual (badges, toasts, modais).
- Escrever testes automatizados para as funções de máscara e validação.
- Substituir a persistência em JSON por um banco leve (ex.: SQLite).

---

## 📜 Licença

Projeto acadêmico/protótipo, sem licença comercial associada. Livre para uso
educacional e estudo.
