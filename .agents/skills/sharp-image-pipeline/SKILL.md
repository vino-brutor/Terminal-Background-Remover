---
name: sharp-image-pipeline
description: Use esta skill sempre que o usuário pedir para modificar src/image.ts do bk-remover — leitura, resize, aplicação de máscara de IA, exportação de imagem, suporte a novos formatos (jpg/png/webp), ou processamento em lote de múltiplas imagens.
---

# Pipeline de Imagem com Sharp — src/image.ts

## Contexto do projeto
`src/image.ts` é o módulo que:
1. Lê a imagem de entrada (jpg, png, webp).
2. Redimensiona conforme necessário para a inferência do modelo (`src/model.ts`).
3. Aplica a máscara de segmentação retornada pelo modelo.
4. Salva a imagem final como PNG com fundo transparente, seguindo a convenção `<nome>_sem_fundo.png`.

## Convenções que devem ser mantidas

1. **Nome de arquivo de saída**
   - Padrão: `<nome-original>_sem_fundo.png`, salvo no mesmo diretório da entrada, a menos que `-o/--output` seja passado (definido em `src/parser.ts`).
   - Sempre exportar como PNG (precisa de canal alpha para transparência) — nunca como JPG, que não suporta transparência.

2. **Ordem correta do pipeline com Sharp**
   ```
   ler imagem → resize (se necessário para o modelo) → obter máscara do model.ts →
   aplicar máscara no canal alpha da imagem ORIGINAL (não na redimensionada) → salvar
   ```
   Atenção: se o resize for feito para a inferência, a máscara de saída do modelo pode vir em resolução menor — é preciso redimensionar a máscara de volta ao tamanho original antes de aplicá-la, ou a imagem final sai com resolução reduzida.

3. **Suporte a múltiplas imagens (`npx bk-remover *.jpg`)**
   - Cada imagem deve ser processada de forma independente; erro em uma imagem não pode interromper o processamento das demais.
   - Reportar no final um resumo (X processadas com sucesso, Y falharam) via `src/ui.ts`.

4. **Novos formatos de entrada**
   - Ao adicionar suporte a um novo formato, validar que o Sharp suporta nativamente (a maioria dos formatos comuns já é suportada sem plugin extra).
   - Atualizar a validação de extensão em `src/parser.ts` e a tabela de formatos no README.

5. **Performance**
   - Evitar carregar a imagem inteira em memória mais de uma vez — usar streams do Sharp (`.pipe()`) quando possível, especialmente ao processar lotes grandes de imagens.

## Checklist ao terminar uma alteração
- [ ] Testei com uma imagem grande (>4000px) para confirmar que não trava por uso de memória.
- [ ] Testei o modo de múltiplos arquivos (`*.jpg`) com pelo menos um arquivo inválido no meio do lote.
- [ ] Confirmei que a imagem de saída tem canal alpha (transparência real, não fundo branco).
