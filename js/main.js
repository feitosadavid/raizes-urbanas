// Comportamentos compartilhados entre as três páginas.
document.addEventListener("DOMContentLoaded", () => {
  const botaoMenu = document.querySelector(".menu-alternar");
  const nav = document.getElementById("nav-principal");

  if (botaoMenu && nav) {
    botaoMenu.addEventListener("click", () => {
      const aberto = nav.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", String(aberto));
      botaoMenu.textContent = aberto ? "Fechar" : "Menu";
    });

    // Fecha o menu ao navegar (útil no mobile, quando os links empilham).
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("aberto");
        botaoMenu.setAttribute("aria-expanded", "false");
        botaoMenu.textContent = "Menu";
      });
    });
  }
});
