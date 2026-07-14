---
name: npm-publish-checklist
description: Use esta skill sempre que o usuário pedir para publicar, versionar ou preparar o bk-remover para release no npm. Cobre bump de versão semântica, build TypeScript, validação do bin/cli.js, e checklist de publicação do pacote offline-background-remover.
---

# NPM Publish Checklist — bk-remover

## Contexto do projeto
- Pacote publicado no npm como `offline-background-remover`, mas invocado via `npx bk-remover`.
- Stack: TypeScript compilado para `dist/`, entrypoint executável em `bin/cli.js` com shebang `#!/usr/bin/env node`.
- Script `prepack` já roda o build antes de publicar (não pular).

## Passos obrigatórios antes de publicar

1. **Rodar build limpo**
   ```bash
   rm -rf dist
   npm run build
   ```
   Falhar aqui = parar. Nunca publicar com build antigo em `dist/`.

2. **Checar o shebang do bin**
   - Confirmar que `bin/cli.js` (ou o arquivo apontado em `package.json > bin`) começa com `#!/usr/bin/env node` e tem permissão de execução (`chmod +x`).
   - Se o build do TypeScript sobrescrever esse arquivo, garantir que o shebang não seja removido pelo compilador.

3. **Versionamento semântico**
   - PATCH (`x.x.N`): correção de bug, ajuste de mensagem de erro, performance sem mudar comportamento.
   - MINOR (`x.N.x`): nova flag no CLI (ex: `--output`, novo formato suportado), sem quebrar uso existente.
   - MAJOR (`N.x.x`): mudança que quebra o uso via `npx` (ex: renomear o comando, mudar nome do arquivo de saída padrão).
   - Usar `npm version patch|minor|major` (isso já atualiza `package.json` e cria a tag git).

4. **Validar localmente antes do publish**
   ```bash
   npm pack
   npx ./offline-background-remover-<versao>.tgz foto-teste.jpg
   ```
   Rodar contra uma imagem real de teste e confirmar que `foto-teste_sem_fundo.png` é gerado corretamente.

5. **Checar `package.json`**
   - `files` inclui `dist/` e `bin/`.
   - `main`/`exports` aponta para o build compilado, nunca para `src/*.ts`.
   - `engines.node` reflete o mínimo real testado (`>=18`).

6. **Publicar**
   ```bash
   npm publish --access public
   ```
   Se for pré-release (beta/rc), usar `--tag beta` e a tag correspondente na versão (`1.2.0-beta.0`).

7. **Pós-publish**
   - Confirmar no npm que a versão subiu: `npm view offline-background-remover version`.
   - Testar o comando real via `npx bk-remover@latest foto.jpg` em uma pasta limpa (fora do repo), pois isso simula exatamente a experiência do usuário final.

## Erros comuns a evitar
- Publicar com `dist/` desatualizado porque o `prepack` foi pulado com `--ignore-scripts`.
- Esquecer de atualizar o README quando uma nova flag é adicionada.
- Quebrar o cache do modelo de IA (`@xenova/transformers`) ao mudar a estrutura de pastas do projeto sem atualizar o caminho de cache em `model.ts`.
