# Contribuindo

## Fluxo

1. Crie uma branch a partir de `main` (`feat/`, `fix/` ou `docs/`).
2. Faça uma mudança pequena e mantenha o código acessível.
3. Execute `npm run check` e `npm test` antes do commit.
4. Abra um pull request descrevendo o problema, a solução, os testes e o impacto WCAG.
5. Aguarde o CI e uma revisão de código antes do merge.

## Checklist do pull request

- [ ] Testes e checagem de sintaxe passam.
- [ ] A navegação por teclado foi verificada.
- [ ] Campos novos têm label, mensagem de erro e estado acessível.
- [ ] Não há dados pessoais reais em `data/cadastros.json`.
- [ ] O README foi atualizado quando o comportamento mudou.
