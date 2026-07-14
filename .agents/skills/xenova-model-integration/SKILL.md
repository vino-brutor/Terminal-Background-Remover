---
name: xenova-model-integration
description: Use esta skill sempre que o usuário pedir para modificar, depurar ou estender src/model.ts do bk-remover — carregamento do modelo de segmentação, cache local, ou troca do modelo de IA usado para remoção de fundo via @xenova/transformers.
---

# Integração com @xenova/transformers — src/model.ts

## Contexto do projeto
`src/model.ts` é o único módulo responsável por:
1. Baixar o modelo de segmentação (~170MB) na primeira execução.
2. Cachear o modelo localmente para execuções seguintes serem instantâneas.
3. Rodar a inferência que gera a máscara de segmentação usada por `src/image.ts`.

Isso é o que garante a promessa central do produto: **100% offline, sem API key, sem envio de dados**. Qualquer mudança aqui que introduza uma chamada de rede externa (além do download único do modelo do Hugging Face) quebra o valor central do projeto — nunca adicionar telemetria, analytics ou chamadas a servidores externos nesse módulo.

## Regras ao editar model.ts

1. **Cache é obrigatório e local**
   - O cache do modelo deve ficar em um diretório local persistente (ex: `~/.cache/bk-remover` ou equivalente do `@xenova/transformers`), nunca em `/tmp` ou em pasta temporária que seja limpa entre execuções.
   - Nunca remover a lógica de "se o modelo já existe em cache, não baixar de novo" — isso é o que torna a segunda execução instantânea, feature explicitamente anunciada no README.

2. **Feedback de download**
   - O download inicial (~170MB) deve sempre disparar um spinner via `src/ui.ts` (Ora), nunca deixar o usuário sem feedback durante esse tempo — download silencioso de 170MB parece travamento.

3. **Troca de modelo**
   - Se o usuário pedir para trocar o modelo de segmentação (ex: por um mais leve ou mais preciso), validar:
     - O modelo precisa ser compatível com `@xenova/transformers` (formato ONNX via Transformers.js).
     - Testar o tamanho do modelo novo — se for muito maior que 170MB, atualizar o aviso no README e no spinner de download.
     - Rodar teste manual comparando a qualidade da máscara gerada (bordas de cabelo/objetos finos costumam ser o ponto fraco).

4. **Formato de saída da inferência**
   - A máscara de segmentação retornada por este módulo deve ser compatível com o que `src/image.ts` espera para compor a imagem final via Sharp (tipicamente um array de pixels 0-255 representando alpha/transparência).
   - Qualquer mudança no shape/formato do output precisa ser refletida nos dois módulos juntos — nunca alterar `model.ts` sem checar o consumidor em `image.ts`.

5. **Tratamento de erro**
   - Falha de download do modelo (sem internet na primeira execução) deve gerar mensagem clara via `ui.ts`, não um stack trace cru — o usuário precisa entender que a *primeira* execução exige internet, mas as seguintes não.

## Checklist ao terminar uma alteração
- [ ] Rodei sem cache (deletando a pasta de cache) para confirmar que o download ainda funciona do zero.
- [ ] Rodei com cache já populado para confirmar que não baixa de novo.
- [ ] Confirmei que nenhuma chamada de rede além do download do modelo foi introduzida.
