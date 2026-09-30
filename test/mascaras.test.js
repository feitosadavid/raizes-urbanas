const test = require("node:test");
const assert = require("node:assert/strict");
const {
  mascararCPF,
  mascararTelefone,
  mascararCEP,
  mascararData,
} = require("../js/mascaras");

test("aplica máscara de CPF", () => {
  assert.equal(mascararCPF("12345678900"), "123.456.789-00");
});

test("aplica máscara de telefone fixo e celular", () => {
  assert.equal(mascararTelefone("1133334444"), "(11) 3333-4444");
  assert.equal(mascararTelefone("11987654321"), "(11) 98765-4321");
});

test("aplica máscara de CEP e data", () => {
  assert.equal(mascararCEP("05435060"), "05435-060");
  assert.equal(mascararData("15031990"), "15/03/1990");
});
