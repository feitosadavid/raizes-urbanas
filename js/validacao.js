// Validação e envio do formulário de cadastro (cadastro.html).
// Combina validação nativa do HTML5 (required, type, pattern, maxlength)
// com regras que o HTML sozinho não expressa: dígito verificador do CPF,
// idade mínima e "pelo menos uma opção marcada" nos interesses.

/** Valida um CPF pelo algoritmo oficial dos dois dígitos verificadores. */
function cpfValido(cpfComMascara) {
  const cpf = somenteDigitos(cpfComMascara);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // 111.111.111-11 etc.

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

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);
  return cpf === cpf.slice(0, 9) + String(digito1) + String(digito2);
}

/** Calcula idade completa em anos a partir de "AAAA-MM-DD". */
function idadeEmAnos(dataISO) {
  if (!dataISO) return null;
  const nascimento = new Date(dataISO + "T00:00:00");
  if (Number.isNaN(nascimento.getTime())) return null;
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

  // Data máxima permitida no seletor = hoje menos 16 anos, para que o
  // próprio calendário nativo já desencoraje datas que não atingem a
  // idade mínima de participação.
  const hoje = new Date();
  const limite = new Date(hoje.getFullYear() - 16, hoje.getMonth(), hoje.getDate());
  campoNascimento.max = limite.toISOString().slice(0, 10);

  ligarMascara(campoCPF, mascararCPF);
  ligarMascara(campoTelefone, mascararTelefone);
  ligarMascara(campoCEP, mascararCEP);

  // Contador de caracteres da mensagem (campo opcional, limite de 500).
  const atualizarContador = () => {
    const restantes = 500 - campoMensagem.value.length;
    contador.textContent = `${restantes} caracteres restantes`;
  };
  campoMensagem.addEventListener("input", atualizarContador);
  atualizarContador();

  // Busca automática de endereço via ViaCEP quando o CEP estiver completo.
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
        avisoCEP.textContent = "CEP não encontrado — preencha o endereço manualmente.";
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
      avisoCEP.textContent =
        "Não foi possível consultar o CEP agora — preencha o endereço manualmente.";
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

  form.addEventListener("submit", (evento) => {
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

    // 2) CPF com dígito verificador.
    if (campoCPF.value && !cpfValido(campoCPF.value)) {
      erros.push(marcarErro("cpf", "Este CPF não é válido. Confira os números digitados."));
    }

    // 3) Idade mínima de 16 anos.
    const idade = idadeEmAnos(campoNascimento.value);
    if (campoNascimento.value && (idade === null || idade < 16)) {
      erros.push(marcarErro("nascimento", "É preciso ter 16 anos ou mais para se cadastrar."));
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

    // Sucesso: nada é enviado a um servidor real neste protótipo — os
    // dados ficam apenas no localStorage do navegador, para demonstrar o
    // fluxo completo sem precisar de um backend.
    const protocolo = gerarProtocolo();
    const registro = {
      protocolo,
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      cidade: document.getElementById("cidade").value.trim(),
      interesses: Array.from(interessesMarcados).map((c) => c.value),
      enviadoEm: new Date().toISOString(),
    };
    const registros = JSON.parse(localStorage.getItem("ru_cadastros") || "[]");
    registros.push(registro);
    localStorage.setItem("ru_cadastros", JSON.stringify(registros));

    document.getElementById("protocolo-gerado").textContent = protocolo;
    document.getElementById("nome-confirmado").textContent = registro.nome;
    painelSucesso.hidden = false;
    form.hidden = true;
    document.querySelector(".form-intro")?.setAttribute("hidden", "");
    painelSucesso.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
