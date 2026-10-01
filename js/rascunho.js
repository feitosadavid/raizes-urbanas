// Rascunho do formulário de cadastro (cadastro.html), guardado em
// localStorage no navegador da pessoa. Objetivo: se ela recarregar a
// página sem querer (ou fechar a aba e voltar depois), o que já foi
// digitado continua lá — sem exigir cadastro nem servidor para isso, já
// que é só uma conveniência de digitação, local ao navegador.

const CHAVE_RASCUNHO_CADASTRO = "ru_rascunho_cadastro";

/** Lê todos os campos do formulário e monta um objeto simples { nome: valor }. */
function coletarRascunhoCadastro(form) {
  const dados = {};
  form.querySelectorAll("input, textarea, select").forEach((campo) => {
    if (!campo.name) return;

    if (campo.type === "checkbox") {
      if (campo.name === "termo") {
        // Checkbox único (aceite do termo): guarda true/false.
        dados[campo.name] = campo.checked;
      } else {
        // Grupo de checkboxes (interesses): guarda um array com os valores marcados.
        if (!Array.isArray(dados[campo.name])) dados[campo.name] = [];
        if (campo.checked) dados[campo.name].push(campo.value);
      }
    } else if (campo.type === "radio") {
      if (campo.checked) dados[campo.name] = campo.value;
    } else {
      dados[campo.name] = campo.value;
    }
  });
  return dados;
}

/** Salva o estado atual do formulário em localStorage. Falha em silêncio se indisponível. */
function salvarRascunhoCadastro(form) {
  try {
    localStorage.setItem(
      CHAVE_RASCUNHO_CADASTRO,
      JSON.stringify(coletarRascunhoCadastro(form)),
    );
  } catch (falha) {
    // Modo de navegação privada, quota excedida etc.: sem problema, o
    // formulário continua funcionando normalmente, só não fica com rascunho.
  }
}

/** Remove o rascunho salvo (chamado após um cadastro enviado com sucesso, ou a pedido). */
function limparRascunhoCadastro() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO_CADASTRO);
  } catch (falha) {
    // Sem localStorage também não havia rascunho para remover.
  }
}

/**
 * Lê o rascunho salvo e preenche os campos do formulário com ele.
 * Devolve true se algum campo foi restaurado (para exibir o aviso).
 */
function restaurarRascunhoCadastro(form) {
  let bruto;
  try {
    bruto = localStorage.getItem(CHAVE_RASCUNHO_CADASTRO);
  } catch (falha) {
    return false;
  }
  if (!bruto) return false;

  let dados;
  try {
    dados = JSON.parse(bruto);
  } catch (falha) {
    return false; // Rascunho corrompido: ignora e segue com o formulário vazio.
  }

  let algoRestaurado = false;
  form.querySelectorAll("input, textarea, select").forEach((campo) => {
    if (!campo.name || !(campo.name in dados)) return;
    const valor = dados[campo.name];

    if (campo.type === "checkbox") {
      campo.checked =
        campo.name === "termo"
          ? Boolean(valor)
          : Array.isArray(valor) && valor.includes(campo.value);
    } else if (campo.type === "radio") {
      campo.checked = campo.value === valor;
    } else {
      campo.value = valor;
    }
    algoRestaurado = true;
  });

  return algoRestaurado;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro");
  if (!form) return; // Este script só atua em cadastro.html.

  const avisoRascunho = document.getElementById("aviso-rascunho");
  const botaoDescartar = document.getElementById("descartar-rascunho");

  const restaurado = restaurarRascunhoCadastro(form);
  if (restaurado) {
    if (avisoRascunho) avisoRascunho.hidden = false;

    // Se a mensagem (textarea) foi restaurada, o contador de caracteres
    // precisa refletir o texto recém-preenchido, não o valor inicial "500".
    const contador = document.getElementById("contador-mensagem");
    const campoMensagem = document.getElementById("mensagem");
    if (contador && campoMensagem) {
      contador.textContent = `${500 - campoMensagem.value.length} caracteres restantes`;
    }
  }

  // Salva a cada digitação, com um pequeno atraso (debounce) para não
  // gravar em localStorage a cada tecla pressionada.
  let temporizadorRascunho = null;
  form.addEventListener("input", () => {
    clearTimeout(temporizadorRascunho);
    temporizadorRascunho = setTimeout(() => salvarRascunhoCadastro(form), 400);
  });

  // Checkboxes, rádios e o <select> de UF disparam "change" mas nem
  // sempre "input" de forma consistente entre navegadores — cobre os dois.
  form.addEventListener("change", () => salvarRascunhoCadastro(form));

  if (botaoDescartar) {
    botaoDescartar.addEventListener("click", () => {
      form.reset();
      limparRascunhoCadastro();
      if (avisoRascunho) avisoRascunho.hidden = true;
      document.getElementById("nome")?.focus();
    });
  }
});

if (typeof globalThis !== "undefined") {
  Object.assign(globalThis, {
    coletarRascunhoCadastro,
    salvarRascunhoCadastro,
    limparRascunhoCadastro,
    restaurarRascunhoCadastro,
  });
}
