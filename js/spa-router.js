// Prova de conceito de Single Page Application (spa-demo.html).
//
// Ideia central: um único documento HTML, um único contêiner de conteúdo
// (#app-spa) e a troca do que aparece nele feita inteiramente em
// JavaScript, sem nunca recarregar a página. A "rota atual" é guardada no
// hash da URL (#/inicio, #/projetos, #/contato); o evento "hashchange"
// avisa quando o usuário navega (clicando num link ou usando
// voltar/avançar do navegador), e uma função de renderização decide qual
// "template" (um literal de template JS, que é só uma string) injetar no
// contêiner via innerHTML.
//
// Isso é deliberadamente simples e não substitui a arquitetura multi-página
// do site principal (index/projetos/cadastro.html), que continua sendo a
// escolha certa para aquele conteúdo — ver a explicação já registrada sobre
// SPA vs. MPA. Esta página existe só para demonstrar, de forma isolada, o
// mecanismo de roteamento client-side e geração de HTML por template.

const projetosSPA = [
  {
    nome: "Hortas comunitárias",
    descricao: "Terrenos públicos ociosos transformados em hortas coletivas, plantadas e colhidas pelos próprios moradores.",
  },
  {
    nome: "Mutirões de plantio",
    descricao: "Ações de um único dia para preparar canteiros, plantar mudas nativas e reformar a infraestrutura das hortas.",
  },
  {
    nome: "Capacitação em agroecologia",
    descricao: "Curso gratuito de oito semanas sobre manejo de solo, compostagem e cultivo orgânico.",
  },
  {
    nome: "Banco de alimentos",
    descricao: "Parte da colheita e doações de mercados parceiros distribuídas a famílias em insegurança alimentar.",
  },
];

/** Cada função abaixo é um "template": recebe dados e devolve uma string de HTML. */
const rotasSPA = {
  "/inicio": () => `
    <section class="spa-secao">
      <h1>Início</h1>
      <p>
        A Raízes Urbanas cuida de hortas comunitárias e capacita moradores para o
        trabalho com agroecologia em São Paulo. Este conteúdo foi renderizado pela
        rota <code>#/inicio</code>, sem recarregar a página.
      </p>
      <ul class="spa-lista-numeros">
        <li><strong>18</strong>hortas ativas</li>
        <li><strong>3.400</strong>famílias atendidas em 2025</li>
        <li><strong>620</strong>voluntários cadastrados</li>
      </ul>
    </section>
  `,
  "/projetos": () => `
    <section class="spa-secao">
      <h1>Projetos</h1>
      <p>Lista gerada dinamicamente a partir do array <code>projetosSPA</code>, iterado com <code>.map()</code>.</p>
      <div class="spa-cards">
        ${projetosSPA
          .map(
            (projeto) => `
              <article class="spa-card">
                <h2>${projeto.nome}</h2>
                <p>${projeto.descricao}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `,
  "/contato": () => `
    <section class="spa-secao">
      <h1>Contato</h1>
      <p>Rua das Acácias, 240 — Vila Madalena, São Paulo/SP</p>
      <p><a href="mailto:contato@raizesurbanas.org.br">contato@raizesurbanas.org.br</a></p>
      <p>Rota atual: <code>#/contato</code>.</p>
    </section>
  `,
};

const ROTA_PADRAO = "/inicio";

/** Lê o hash atual da URL e devolve o caminho da rota (sem o "#"). */
function lerRotaAtual() {
  const hash = window.location.hash.replace(/^#/, "");
  return rotasSPA[hash] ? hash : ROTA_PADRAO;
}

/** Renderiza a rota atual dentro do contêiner e atualiza o link ativo no menu. */
function renderizarRotaSPA() {
  const rota = lerRotaAtual();
  const app = document.getElementById("app-spa");
  if (!app) return;

  app.innerHTML = rotasSPA[rota]();

  document.querySelectorAll(".spa-nav a").forEach((link) => {
    const alvo = link.getAttribute("href").replace(/^#/, "");
    link.classList.toggle("ativo", alvo === rota);
  });

  // Move o foco para o novo conteúdo: importante para quem navega por
  // teclado ou leitor de tela perceber que a "página" mudou.
  app.setAttribute("tabindex", "-1");
  app.focus();
}

// Se a URL não tiver rota nenhuma ainda (primeira visita), define a padrão
// sem criar uma entrada extra no histórico de navegação.
if (!window.location.hash) {
  window.history.replaceState(null, "", `#${ROTA_PADRAO}`);
}

window.addEventListener("hashchange", renderizarRotaSPA);
document.addEventListener("DOMContentLoaded", renderizarRotaSPA);
