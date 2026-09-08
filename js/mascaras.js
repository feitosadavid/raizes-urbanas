// Máscaras de entrada. Cada função reformata o valor a cada evento "input",
// mantendo apenas os dígitos como fonte de verdade e reconstruindo a
// pontuação — assim funciona tanto para quem digita quanto para quem cola.

function somenteDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

/** Aplica a máscara 000.000.000-00, limitando a 11 dígitos. */
function mascararCPF(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  let saida = d;
  if (d.length > 9) {
    saida = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  } else if (d.length > 6) {
    saida = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  } else if (d.length > 3) {
    saida = `${d.slice(0, 3)}.${d.slice(3)}`;
  }
  return saida;
}

/**
 * Aplica a máscara de telefone brasileiro, alternando automaticamente entre
 * fixo — (00) 0000-0000 — e celular — (00) 00000-0000 — conforme a
 * quantidade de dígitos digitados.
 */
function mascararTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  let saida = d;
  if (d.length > 10) {
    saida = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  } else if (d.length > 6) {
    saida = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  } else if (d.length > 2) {
    saida = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  } else if (d.length > 0) {
    saida = `(${d}`;
  }
  return saida;
}

/** Aplica a máscara 00000-000, limitando a 8 dígitos. */
function mascararCEP(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  let saida = d;
  if (d.length > 5) {
    saida = `${d.slice(0, 5)}-${d.slice(5)}`;
  }
  return saida;
}

/** Aplica a máscara brasileira de data 00/00/0000, limitando a 8 dígitos. */
function mascararData(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  let saida = d;
  if (d.length > 4) {
    saida = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  } else if (d.length > 2) {
    saida = `${d.slice(0, 2)}/${d.slice(2)}`;
  }
  return saida;
}

/**
 * Liga uma função de máscara a um campo: reaplica o formato a cada
 * digitação e preserva a posição do cursor de forma simples (fim do valor),
 * o que é aceitável para máscaras curtas como estas.
 */
function ligarMascara(input, funcaoMascara) {
  if (!input) return;
  input.addEventListener("input", () => {
    const posicaoAntiga = input.value.length;
    input.value = funcaoMascara(input.value);
    // Mantém o cursor no fim quando o usuário está digitando para frente;
    // evita saltos bruscos em edições simples no meio do texto.
    if (input.selectionStart === posicaoAntiga) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}
