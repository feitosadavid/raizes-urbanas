const test = require("node:test");
const assert = require("node:assert/strict");
const { dataBRValida, idadeEmAnos, validarCadastro } = require("../server");
const { criarServidor } = require("../server");

const cadastroValido = {
  nome: "Ana Souza",
  email: "ana@example.com",
  cpf: "123.456.789-00",
  telefone: "(11) 98765-4321",
  nascimento: "15/03/1990",
  endereco: {
    cep: "05435-060",
    logradouro: "Rua Harmonia",
    numero: "100",
    complemento: "",
    bairro: "Vila Madalena",
    cidade: "São Paulo",
    uf: "SP",
  },
  interesses: ["Hortas comunitárias"],
  disponibilidade: "Manhã",
  termo: true,
  mensagem: "",
};

test("valida data real e rejeita data impossível", () => {
  assert.equal(dataBRValida("29/02/2024"), true);
  assert.equal(dataBRValida("31/02/2024"), false);
});

test("calcula idade completa", () => {
  assert.ok(idadeEmAnos("15/03/1990") >= 36);
});

test("aceita cadastro completo", () => {
  assert.deepEqual(validarCadastro(cadastroValido), []);
});

test("rejeita cadastro sem consentimento e com formato inválido", () => {
  const erros = validarCadastro({
    ...cadastroValido,
    email: "invalido",
    termo: false,
  });
  assert.ok(erros.some((erro) => erro.includes("E-mail")));
  assert.ok(erros.some((erro) => erro.includes("termo")));
});

test("serve a página com headers de segurança e protege arquivos internos", async () => {
  const servidor = criarServidor();
  await new Promise((resolve) => servidor.listen(0, "127.0.0.1", resolve));
  const porta = servidor.address().port;
  try {
    const pagina = await fetch(`http://127.0.0.1:${porta}/`);
    assert.equal(pagina.status, 200);
    assert.equal(pagina.headers.get("x-content-type-options"), "nosniff");
    assert.match(
      pagina.headers.get("content-security-policy"),
      /default-src 'self'/,
    );

    const interno = await fetch(`http://127.0.0.1:${porta}/server.js`);
    assert.equal(interno.status, 404);

    const administrativo = await fetch(
      `http://127.0.0.1:${porta}/api/cadastros`,
    );
    assert.equal(administrativo.status, 404);
  } finally {
    await new Promise((resolve, reject) =>
      servidor.close((erro) => (erro ? reject(erro) : resolve())),
    );
  }
});
