const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const paginas = [
  "index.html",
  "projetos.html",
  "cadastro.html",
  "spa-demo.html",
];

function lerPagina(nome) {
  return fs.readFileSync(path.join(__dirname, "..", nome), "utf8");
}

test("páginas públicas mantêm estrutura acessível básica", () => {
  for (const pagina of paginas) {
    const html = lerPagina(pagina);
    assert.match(html, /<html\s+lang="pt-BR"/i, `${pagina}: lang ausente`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${pagina}: title ausente`);
    assert.match(html, /<main\b[^>]*id="[^"]+"/i, `${pagina}: main ausente`);
    assert.match(
      html,
      /class="pular-conteudo"\s+href="#([^\"]+)"/i,
      `${pagina}: skip link ausente`,
    );
    assert.doesNotMatch(
      html,
      /\sstyle\s*=/i,
      `${pagina}: estilo inline encontrado`,
    );
  }
});

test("campos do cadastro possuem labels associados", () => {
  const html = lerPagina("cadastro.html");
  const ids = [
    ...html.matchAll(/<(?:input|textarea|select)\b[^>]*\bid="([^"]+)"/gi),
  ].map((match) => match[1]);
  const labels = new Set(
    [...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/gi)].map(
      (match) => match[1],
    ),
  );
  for (const id of ids)
    assert.ok(labels.has(id), `cadastro.html: label ausente para ${id}`);
});
