// Servidor HTTP sem dependências externas para desenvolvimento e deploy simples.

const crypto = require("crypto");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORTA = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const RAIZ_DO_SITE = __dirname;
const ARQUIVO_DE_DADOS = path.join(__dirname, "data", "cadastros.json");
const LIMITE_CORPO = 1e6;
const PAGINAS_PUBLICAS = new Set([
  "index.html",
  "projetos.html",
  "cadastro.html",
  "spa-demo.html",
]);
const INTERESSES_VALIDOS = new Set([
  "Hortas comunitárias",
  "Capacitação",
  "Logística e transporte",
  "Comunicação",
]);
const DISPONIBILIDADES_VALIDAS = new Set([
  "Manhã",
  "Tarde",
  "Noite",
  "Fins de semana",
]);

const TIPOS_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function cabecalhosSeguros(tipo, cache = false) {
  return {
    "Content-Type": tipo,
    "Cache-Control": cache ? "public, max-age=3600" : "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": [
      "default-src 'self'",
      "style-src 'self' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "script-src 'self'",
      "connect-src 'self' https://viacep.com.br",
      "img-src 'self' data:",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  };
}

function garantirArquivoDeDados() {
  const pasta = path.dirname(ARQUIVO_DE_DADOS);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  if (!fs.existsSync(ARQUIVO_DE_DADOS))
    fs.writeFileSync(ARQUIVO_DE_DADOS, "[]\n", "utf8");
}

function lerCadastros() {
  garantirArquivoDeDados();
  try {
    return JSON.parse(fs.readFileSync(ARQUIVO_DE_DADOS, "utf8") || "[]");
  } catch {
    return [];
  }
}

function salvarCadastros(lista) {
  const temporario = `${ARQUIVO_DE_DADOS}.tmp`;
  fs.writeFileSync(temporario, `${JSON.stringify(lista, null, 2)}\n`, "utf8");
  fs.renameSync(temporario, ARQUIVO_DE_DADOS);
}

function gerarProtocolo() {
  const ano = new Date().getFullYear();
  return `RU-${ano}-${crypto.randomInt(100000, 1000000)}`;
}

const formatadorSaoPaulo = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function agoraEmSaoPaulo() {
  return `${formatadorSaoPaulo.format(new Date()).replace(" ", "T")}-03:00`;
}

function dataBRValida(dataBR) {
  const combinacao = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBR || "");
  if (!combinacao) return false;
  const dia = Number(combinacao[1]);
  const mes = Number(combinacao[2]);
  const ano = Number(combinacao[3]);
  const data = new Date(ano, mes - 1, dia);
  return (
    mes >= 1 &&
    mes <= 12 &&
    dia >= 1 &&
    data.getDate() === dia &&
    data.getMonth() === mes - 1 &&
    data <= new Date()
  );
}

function idadeEmAnos(dataBR) {
  const [dia, mes, ano] = (dataBR || "").split("/").map(Number);
  if (!dia || !mes || !ano) return null;
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje <
    new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate())
  )
    idade -= 1;
  return idade;
}

function textoValido(valor, minimo, maximo) {
  return (
    typeof valor === "string" &&
    valor.trim().length >= minimo &&
    valor.trim().length <= maximo
  );
}

function validarCadastro(dados) {
  const erros = [];
  if (!dados || typeof dados !== "object" || Array.isArray(dados))
    return ["O corpo da requisição deve ser um objeto JSON."];
  if (!textoValido(dados.nome, 3, 120)) erros.push("Nome inválido.");
  if (
    !textoValido(dados.email, 3, 160) ||
    !/^\S+@\S+\.\S+$/.test(dados.email.trim())
  )
    erros.push("E-mail inválido.");
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(dados.cpf || ""))
    erros.push("CPF inválido.");
  if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(dados.telefone || ""))
    erros.push("Telefone inválido.");
  if (!dataBRValida(dados.nascimento) || idadeEmAnos(dados.nascimento) < 16)
    erros.push("Data de nascimento inválida ou idade inferior a 16 anos.");

  const endereco = dados.endereco;
  if (!endereco || typeof endereco !== "object") {
    erros.push("Endereço obrigatório.");
  } else {
    if (!/^\d{5}-\d{3}$/.test(endereco.cep || "")) erros.push("CEP inválido.");
    ["logradouro", "numero", "bairro", "cidade"].forEach((campo) => {
      if (!textoValido(endereco[campo], 1, 150))
        erros.push(`Endereço: ${campo} inválido.`);
    });
    if (!/^[A-Za-z]{2}$/.test(endereco.uf || "")) erros.push("UF inválida.");
    if (endereco.complemento && !textoValido(endereco.complemento, 1, 60))
      erros.push("Complemento inválido.");
  }
  if (
    !Array.isArray(dados.interesses) ||
    dados.interesses.length < 1 ||
    dados.interesses.some((item) => !INTERESSES_VALIDOS.has(item))
  )
    erros.push("Interesses inválidos.");
  if (!DISPONIBILIDADES_VALIDAS.has(dados.disponibilidade))
    erros.push("Disponibilidade inválida.");
  if (dados.termo !== true)
    erros.push("O termo de voluntariado deve ser aceito.");
  if (dados.mensagem && !textoValido(dados.mensagem, 1, 500))
    erros.push("Mensagem inválida.");
  return erros;
}

function normalizarCadastro(dados) {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    cpf: dados.cpf,
    telefone: dados.telefone,
    nascimento: dados.nascimento,
    endereco: {
      cep: dados.endereco.cep,
      logradouro: dados.endereco.logradouro.trim(),
      numero: dados.endereco.numero.trim(),
      complemento: (dados.endereco.complemento || "").trim(),
      bairro: dados.endereco.bairro.trim(),
      cidade: dados.endereco.cidade.trim(),
      uf: dados.endereco.uf.trim().toUpperCase(),
    },
    interesses: dados.interesses,
    disponibilidade: dados.disponibilidade,
    mensagem: (dados.mensagem || "").trim(),
  };
}

function responderJSON(res, status, corpo) {
  res.writeHead(status, cabecalhosSeguros("application/json; charset=utf-8"));
  res.end(JSON.stringify(corpo));
}

function tratarCadastro(req, res) {
  let corpoBruto = "";
  let excedeuLimite = false;
  req.on("data", (pedaco) => {
    corpoBruto += pedaco;
    if (corpoBruto.length > LIMITE_CORPO) excedeuLimite = true;
  });
  req.on("end", () => {
    if (excedeuLimite)
      return responderJSON(res, 413, { mensagem: "Requisição muito grande." });
    let dados;
    try {
      dados = JSON.parse(corpoBruto);
    } catch {
      return responderJSON(res, 400, { mensagem: "JSON inválido." });
    }
    const erros = validarCadastro(dados);
    if (erros.length)
      return responderJSON(res, 400, { mensagem: erros.join(" ") });

    const registro = normalizarCadastro(dados);
    const registros = lerCadastros();
    registros.push({
      protocolo: gerarProtocolo(),
      ...registro,
      recebidoEm: agoraEmSaoPaulo(),
    });
    salvarCadastros(registros);
    responderJSON(res, 201, { protocolo: registros.at(-1).protocolo });
  });
}

function tratarListaCadastros(req, res) {
  if (!ADMIN_TOKEN || req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return responderJSON(res, 404, { mensagem: "Recurso não encontrado." });
  }
  responderJSON(res, 200, lerCadastros());
}

function tratarArquivoEstatico(req, res, url) {
  const caminhoRelativo =
    url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const caminhoAbsoluto = path.resolve(RAIZ_DO_SITE, caminhoRelativo);
  const relativo = path.relative(RAIZ_DO_SITE, caminhoAbsoluto);
  const relativoURL = relativo.split(path.sep).join("/");
  const extensao = path.extname(caminhoAbsoluto).toLowerCase();
  const diretorioPublico =
    relativoURL.startsWith("css/") || relativoURL.startsWith("js/");
  if (
    relativo.startsWith("..") ||
    path.isAbsolute(relativo) ||
    (!PAGINAS_PUBLICAS.has(relativoURL) && !diretorioPublico) ||
    ![".html", ".css", ".js", ".svg", ".ico"].includes(extensao)
  ) {
    res.writeHead(404, cabecalhosSeguros("text/plain; charset=utf-8"));
    return res.end("Página não encontrada.");
  }
  fs.readFile(caminhoAbsoluto, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, cabecalhosSeguros("text/plain; charset=utf-8"));
      return res.end("Página não encontrada.");
    }
    res.writeHead(
      200,
      cabecalhosSeguros(TIPOS_MIME[extensao], extensao !== ".html"),
    );
    res.end(conteudo);
  });
}

function criarServidor() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (req.method === "POST" && url.pathname === "/api/cadastro")
      return tratarCadastro(req, res);
    if (req.method === "GET" && url.pathname === "/api/cadastros")
      return tratarListaCadastros(req, res);
    if (req.method === "GET") return tratarArquivoEstatico(req, res, url);
    res.writeHead(405, {
      Allow: "GET, POST",
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Método não permitido.");
  });
}

if (require.main === module) {
  garantirArquivoDeDados();
  criarServidor().listen(PORTA, HOST, () => {
    console.log(`Raízes Urbanas rodando em http://localhost:${PORTA}`);
    console.log(`Cadastros salvos em: ${ARQUIVO_DE_DADOS}`);
  });
}

module.exports = { criarServidor, dataBRValida, idadeEmAnos, validarCadastro };
