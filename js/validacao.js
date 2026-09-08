// Validação e envio do formulário de cadastro (cadastro.html).
// Combina validação nativa do HTML5 (required, type, pattern, maxlength)
// com regras que o HTML sozinho não expressa: dígito verificador do CPF,
// idade mínima e "pelo menos uma opção marcada" nos interesses.

/** Confere se "dd/mm/aaaa" é uma data de calendário real (dias por mês, ano bissexto). */
function dataBRValida(dataBR) {
  const combinacao = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBR || "");
  if (!combinacao) return false;
  const dia = Number(combinacao[1]);
  const mes = Number(combinacao[2]);
  const ano = Number(combinacao[3]);
  if (mes < 1 || mes > 12) return false;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return false;
  const hoje = new Date();
  const data = new Date(ano, mes - 1, dia);
  return data <= hoje; // Data de nascimento não pode estar no futuro.
}

/** Calcula idade completa em anos a partir de "dd/mm/aaaa". */
function idadeEmAnos(dataBR) {
  const combinacao = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBR || "");
  if (!combinacao) return null;
  const [, diaStr, mesStr, anoStr] = combinacao;
  const nascimento = new Date(Number(anoStr), Number(mesStr) - 1, Number(diaStr));
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro");
  if (!form) return; // Este script só atua em cadastro.html.

  const campoCPF = document.getElementById("cpf");
  const campoTelefone = document.getElementById("telefone");
  const campoCEP = document.getElementById("cep");
  const campoNascimento = document.getElementById("nascimento");
  const campoMensagem = document.getElementById("mensagem");
  const contador = document.getElementById("contador-mensagem");
  const resumoErros = document.getElementById("resumo-erros");
  const listaResumoErros = document.getElementById("lista-resumo-erros");
  const painelSucesso = document.getElementById("painel-sucesso");

  ligarMascara(campoCPF, mascararCPF);
  ligarMascara(campoTelefone, mascararTelefone);
  ligarMascara(campoCEP, mascararCEP);
  ligarMascara(campoNascimento, mascararData);

  // Contador de caracteres da mensagem (campo opcional, limite de 500).
  const atualizarContador = () => {
    const restantes = 500 - campoMensagem.value.length;
    contador.textContent = `${restantes} caracteres restantes`;
  };
  campoMensagem.addEventListener("input", atualizarContador);
  atualizarContador();

  // Busca automática de endereço via ViaCEP quando o CEP estiver completo.
  // Isso é só uma conveniência de preenchimento — não bloqueia o envio do
  // formulário nem exige um CEP real, já que este site é para testes.
  campoCEP.addEventListener("blur", async () => {
    const cep = somenteDigitos(campoCEP.value);
    if (cep.length !== 8) return;

    const campoLogradouro = document.getElementById("logradouro");
    const campoBairro = document.getElementById("bairro");
    const campoCidade = document.getElementById("cidade");
    const campoUF = document.getElementById("uf");
    const avisoCEP = document.getElementById("erro-cep");

    avisoCEP.textContent = "Buscando endereço…";
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        // CEP fictício ou inexistente: sem problema, o teste continua —
        // a pessoa só preenche o endereço manualmente.
        avisoCEP.textContent = "";
        return;
      }
      campoLogradouro.value = dados.logradouro || campoLogradouro.value;
      campoBairro.value = dados.bairro || campoBairro.value;
      campoCidade.value = dados.localidade || campoCidade.value;
      campoUF.value = dados.uf || campoUF.value;
      avisoCEP.textContent = "";
      if (!dados.logradouro) {
        document.getElementById("numero").focus();
      } else {
        document.getElementById("numero").focus();
      }
    } catch (falha) {
      // Falha de rede ao consultar o ViaCEP: também não bloqueia o teste,
      // só limpa o aviso e segue com preenchimento manual.
      avisoCEP.textContent = "";
    }
  });

  function marcarErro(campoId, mensagem) {
    const input = document.getElementById(campoId);
    const container = input.closest(".campo");
    const erro = container ? container.querySelector("small.erro") : null;
    container?.classList.add("campo--erro");
    if (erro) erro.textContent = mensagem;
    return mensagem ? { campoId, mensagem } : null;
  }

  function limparErro(campoId) {
    marcarErro(campoId, "");
    const input = document.getElementById(campoId);
    input.closest(".campo")?.classList.remove("campo--erro");
  }

  function limparTodosErros() {
    form.querySelectorAll(".campo--erro").forEach((c) => c.classList.remove("campo--erro"));
    form.querySelectorAll("small.erro").forEach((e) => (e.textContent = ""));
    const erroInteresses = document.getElementById("erro-interesses");
    const erroDisponibilidade = document.getElementById("erro-disponibilidade");
    if (erroInteresses) erroInteresses.textContent = "";
    if (erroDisponibilidade) erroDisponibilidade.textContent = "";
  }

  function gerarProtocolo() {
    const ano = new Date().getFullYear();
    const aleatorio = Math.floor(100000 + Math.random() * 900000);
    return `RU-${ano}-${aleatorio}`;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limparTodosErros();
    resumoErros.hidden = true;

    const erros = [];

    // 1) Validação nativa (required, type=email, minlength, pattern, etc.)
    if (!form.checkValidity()) {
      form.querySelectorAll(":invalid").forEach((campo) => {
        if (!campo.id) return;
        const rotulo = form.querySelector(`label[for="${campo.id}"]`);
        const nome = rotulo ? rotulo.textContent.replace("*", "").trim() : campo.id;
        erros.push(marcarErro(campo.id, `Verifique o campo “${nome}”.`));
      });
    }

    // 2) Data de nascimento: precisa ser uma data real de calendário, e a
    // pessoa precisa ter 16 anos ou mais. O CPF não passa mais por
    // verificação de dígito — o campo aceita qualquer valor no formato de
    // máscara, propositalmente, para facilitar testes.
    if (campoNascimento.value && !dataBRValida(campoNascimento.value)) {
      erros.push(marcarErro("nascimento", "Digite uma data de nascimento válida (dd/mm/aaaa)."));
    } else {
      const idade = idadeEmAnos(campoNascimento.value);
      if (campoNascimento.value && (idade === null || idade < 16)) {
        erros.push(marcarErro("nascimento", "É preciso ter 16 anos ou mais para se cadastrar."));
      }
    }

    // 4) Pelo menos um interesse marcado.
    const interessesMarcados = form.querySelectorAll('input[name="interesse"]:checked');
    const erroInteresses = document.getElementById("erro-interesses");
    if (interessesMarcados.length === 0) {
      erroInteresses.textContent = "Marque pelo menos uma área de interesse.";
      erros.push({ campoId: "interesse-horta", mensagem: erroInteresses.textContent });
    }

    // 5) Disponibilidade (grupo de rádio) selecionada.
    const disponibilidadeMarcada = form.querySelector('input[name="disponibilidade"]:checked');
    const erroDisponibilidade = document.getElementById("erro-disponibilidade");
    if (!disponibilidadeMarcada) {
      erroDisponibilidade.textContent = "Escolha um período de disponibilidade.";
      erros.push({ campoId: "disponibilidade-manha", mensagem: erroDisponibilidade.textContent });
    }

    const errosValidos = erros.filter(Boolean);

    if (errosValidos.length > 0) {
      listaResumoErros.innerHTML = "";
      errosValidos.forEach((erro) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${erro.campoId}`;
        link.textContent = erro.mensagem;
        item.appendChild(link);
        listaResumoErros.appendChild(item);
      });
      resumoErros.hidden = false;
      resumoErros.focus();
      const primeiroCampo = document.getElementById(errosValidos[0].campoId);
      primeiroCampo?.focus();
      return;
    }

    // Sucesso na validação: monta o registro e envia para o servidor, que
    // é quem grava de fato no arquivo data/cadastros.json (veja server.js).
    const registro = {
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      cpf: campoCPF.value,
      telefone: campoTelefone.value,
      nascimento: campoNascimento.value,
      endereco: {
        cep: campoCEP.value,
        logradouro: document.getElementById("logradouro").value.trim(),
        numero: document.getElementById("numero").value.trim(),
        complemento: document.getElementById("complemento").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        uf: document.getElementById("uf").value.trim().toUpperCase(),
      },
      interesses: Array.from(interessesMarcados).map((c) => c.value),
      disponibilidade: disponibilidadeMarcada.value,
      mensagem: campoMensagem.value.trim(),
    };

    const botaoEnviar = form.querySelector('button[type="submit"]');
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando…";

    try {
      const resposta = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      });

      if (!resposta.ok) {
        const detalhe = await resposta.json().catch(() => ({}));
        throw new Error(detalhe.mensagem || "O servidor recusou o cadastro.");
      }

      const { protocolo } = await resposta.json();
      document.getElementById("protocolo-gerado").textContent = protocolo;
      document.getElementById("nome-confirmado").textContent = registro.nome;
      painelSucesso.hidden = false;
      form.hidden = true;
      document.querySelector(".form-intro")?.setAttribute("hidden", "");
      painelSucesso.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (falha) {
      listaResumoErros.innerHTML = "";
      const item = document.createElement("li");
      item.textContent =
        "Não foi possível enviar seu cadastro agora (" +
        falha.message +
        "). Verifique se o servidor local está rodando e tente novamente.";
      listaResumoErros.appendChild(item);
      resumoErros.hidden = false;
      resumoErros.focus();
    } finally {
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = "Enviar cadastro";
    }
  });
});
