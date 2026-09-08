// Servidor mínimo, só com módulos nativos do Node — sem npm install.
// Duas funções:
//   1) Serve os arquivos estáticos do site (index.html, css/, js/...).
//   2) Recebe POST /api/cadastro e grava o registro em data/cadastros.json,
//      que funciona aqui como um "banco de dados" simples em arquivo.
//
// Rodar com: node server.js
// Depois abrir: http://localhost:3000

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORTA = 3000;
const RAIZ_DO_SITE = __dirname;
const ARQUIVO_DE_DADOS = path.join(__dirname, "data", "cadastros.json");

const TIPOS_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/** Garante que a pasta data/ e o arquivo cadastros.json existam. */
function garantirArquivoDeDados() {
  const pasta = path.dirname(ARQUIVO_DE_DADOS);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  if (!fs.existsSync(ARQUIVO_DE_DADOS)) {
    fs.writeFileSync(ARQUIVO_DE_DADOS, "[]\n", "utf8");
  }
}

function lerCadastros() {
  garantirArquivoDeDados();
  const conteudo = fs.readFileSync(ARQUIVO_DE_DADOS, "utf8");
  try {
    return JSON.parse(conteudo || "[]");
  } catch {
    return []; // Arquivo corrompido ou vazio: começa uma lista nova.
  }
}

function salvarCadastros(lista) {
  fs.writeFileSync(ARQUIVO_DE_DADOS, JSON.stringify(lista, null, 2), "utf8");
}

/** Mesma verificação de dígito do CPF usada no navegador — nunca confie só no cliente. */
function cpfValido(cpfComMascara) {
  const cpf = (cpfComMascara || "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const char of base) {
      soma += Number(char) * peso;
      peso -= 1;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = calcularDigito(cpf.slice(0, 9));
  const d2 = calcularDigito(cpf.slice(0, 9) + d1);
  return cpf === cpf.slice(0, 9) + String(d1) + String(d2);
}

function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const aleatorio = Math.floor(100000 + Math.random() * 900000);
  return `RU-${ano}-${aleatorio}`;
}

function responderJSON(res, status, corpo) {
  const texto = JSON.stringify(corpo);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(texto);
}

function tratarCadastro(req, res) {
  let corpoBruto = "";
  req.on("data", (pedaco) => {
    corpoBruto += pedaco;
    if (corpoBruto.length > 1e6) req.destroy(); // Trava contra corpos gigantes.
  });
  req.on("end", () => {
    let dados;
    try {
      dados = JSON.parse(corpoBruto);
    } catch {
      return responderJSON(res, 400, { mensagem: "JSON inválido." });
    }

    // Validação mínima de integridade no servidor (o cliente já validou o
    // resto, mas o servidor nunca deve confiar cegamente no cliente).
    const camposObrigatorios = ["nome", "email", "cpf", "telefone", "nascimento"];
    const faltando = camposObrigatorios.filter((campo) => !dados[campo]);
    if (faltando.length > 0) {
      return responderJSON(res, 400, {
        mensagem: `Campos obrigatórios ausentes: ${faltando.join(", ")}.`,
      });
    }
    if (!cpfValido(dados.cpf)) {
      return responderJSON(res, 400, { mensagem: "CPF inválido." });
    }

    const registros = lerCadastros();
    const protocolo = gerarProtocolo();
    registros.push({
      protocolo,
      ...dados,
      recebidoEm: new Date().toISOString(),
    });
    salvarCadastros(registros);

    responderJSON(res, 201, { protocolo });
  });
}

function tratarArquivoEstatico(req, res) {
  const urlSemQuery = req.url.split("?")[0];
  const caminhoRelativo = urlSemQuery === "/" ? "/index.html" : urlSemQuery;
  const caminhoAbsoluto = path.normalize(path.join(RAIZ_DO_SITE, caminhoRelativo));

  // Impede sair da pasta do site (ex.: "/../server.js").
  if (!caminhoAbsoluto.startsWith(RAIZ_DO_SITE)) {
    res.writeHead(403);
    return res.end("Acesso negado.");
  }

  fs.readFile(caminhoAbsoluto, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Página não encontrada.");
    }
    const extensao = path.extname(caminhoAbsoluto);
    res.writeHead(200, { "Content-Type": TIPOS_MIME[extensao] || "application/octet-stream" });
    res.end(conteudo);
  });
}

const servidor = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/cadastro") {
    return tratarCadastro(req, res);
  }
  if (req.method === "GET" && req.url === "/api/cadastros") {
    // Endpoint simples de consulta — sem autenticação, só para o protótipo.
    return responderJSON(res, 200, lerCadastros());
  }
  if (req.method === "GET") {
    return tratarArquivoEstatico(req, res);
  }
  res.writeHead(405);
  res.end("Método não permitido.");
});

garantirArquivoDeDados();
servidor.listen(PORTA, () => {
  console.log(`Raízes Urbanas rodando em http://localhost:${PORTA}`);
  console.log(`Cadastros salvos em: ${ARQUIVO_DE_DADOS}`);
});
