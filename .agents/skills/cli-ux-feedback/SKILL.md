---
name: cli-ux-feedback
description: Use esta skill sempre que o usuário pedir para adicionar, revisar ou padronizar mensagens de terminal, spinners, cores ou textos de erro/ajuda no bk-remover, incluindo src/ui.ts, src/parser.ts (help text) e mensagens de --help/--version.
---

# Padrão de UX no Terminal — bk-remover

## Contexto do projeto
O diferencial do bk-remover é ser "sem anúncios, sem envio de dados, apenas IA rodando na sua máquina" — a experiência de terminal precisa refletir isso: direta, sem ruído, sem fricção.

`src/ui.ts` centraliza:
- Spinners (Ora) para etapas demoradas (download do modelo, inferência).
- Cores (Picocolors) para diferenciar sucesso, erro e informação.

## Regras de estilo

1. **Nunca dois spinners simultâneos** — cada etapa (download do modelo, processamento de cada imagem) tem seu próprio spinner sequencial, nunca sobrepostos.

2. **Paleta de cores consistente** (via Picocolors):
   - Verde: sucesso (ex: "✔ foto_sem_fundo.png gerado").
   - Vermelho: erro (ex: "✘ falha ao processar foto.jpg: formato não suportado").
   - Amarelo: avisos (ex: primeira execução, baixando modelo ~170MB).
   - Sem cor/padrão: informação neutra.

3. **Mensagens de erro sempre acionáveis**
   - Nunca expor stack trace cru para o usuário final por padrão.
   - Toda mensagem de erro deve dizer o que aconteceu E o que fazer (ex: "Formato .heic não suportado. Use jpg, png ou webp.").
   - Stack trace completo só deve aparecer com uma flag de debug/verbose, se existir.

4. **Texto de `--help`**
   - Manter sincronizado com o README — qualquer flag nova documentada em `src/parser.ts` precisa também ser adicionada na seção "⚙️ Uso" do README.

5. **Processamento em lote**
   - Ao processar múltiplos arquivos, mostrar progresso claro (ex: "[2/5] processando foto2.jpg...") em vez de um spinner genérico sem contexto de quantos faltam.

## Checklist ao terminar uma alteração
- [ ] Testei o fluxo de erro (arquivo inexistente, formato inválido) e a mensagem é clara sem stack trace.
- [ ] Cores seguem a paleta (verde/vermelho/amarelo) e não foram usadas cores fora do padrão.
- [ ] `--help` está sincronizado com o README.
