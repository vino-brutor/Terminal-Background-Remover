<div align="center">

# ✂️ bk-remover

**Remoção de fundo de imagens 100% offline, direto no terminal.**

[![NPM Version](https://img.shields.io/npm/v/offline-background-remover?color=cb3837&label=npm&logo=npm)](https://www.npmjs.com/package/offline-background-remover)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

```bash
npx bk-remover foto.jpg
```

> Sem APIs. Sem anúncios. Sem envio de dados. Apenas IA rodando na sua máquina.

</div>

---

## 📖 Sumário

- [✨ O Conceito](#-o-conceito)
- [🎯 O Problema que Resolve](#-o-problema-que-resolve)
- [🚀 Início Rápido](#-início-rápido)
- [⚙️ Uso](#️-uso)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📦 Instalação para Desenvolvimento](#-instalação-para-desenvolvimento)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

---

## ✨ O Conceito

O **bk-remover** é uma ferramenta de linha de comando (CLI) construída em **Node.js** e **TypeScript** que permite remover o fundo de imagens diretamente pelo terminal.

O grande diferencial é a execução **100% offline e local**, utilizando modelos de Inteligência Artificial sem a necessidade de chaves de API ou envio de dados para servidores externos. Sua privacidade e suas imagens ficam completamente na sua máquina.

---

## 🎯 O Problema que Resolve

Desenvolvedores e designers frequentemente precisam remover o fundo de imagens de forma rápida. As soluções atuais apresentam problemas:

| Solução Atual | Problema |
|---|---|
| 🖥️ Photoshop / Softwares | Pesados, pagos e lentos de abrir |
| 🌐 Sites online | Cheios de anúncios, limite de uso e privacidade duvidosa |
| 🔑 APIs pagas | Exigem cadastro, chave de API e cobram por uso |

O `bk-remover` resolve tudo isso com **um único comando de terminal**:

```bash
npx bk-remover foto.jpg
```

---

## 🚀 Início Rápido

Não é necessária nenhuma instalação global. Use diretamente via `npx`:

```bash
# Uso básico — gera "foto_sem_fundo.png" no mesmo diretório
npx bk-remover foto.jpg

# Especificar arquivo de saída
npx bk-remover foto.jpg --output resultado.png

# Processar múltiplas imagens
npx bk-remover *.jpg
```

> **Na primeira execução**, o modelo de IA (~170 MB) será baixado e armazenado em cache localmente. As execuções seguintes serão instantâneas.

---

## ⚙️ Uso

```
Usage: bk-remover [options] <imagem>

Argumentos:
  imagem                Caminho para a imagem de entrada (jpg, png, webp)

Opções:
  -o, --output <path>   Caminho para a imagem de saída (padrão: <nome>_sem_fundo.png)
  -v, --version         Exibe a versão atual
  -h, --help            Exibe informações de ajuda
```

---

## 🏗️ Arquitetura

O projeto adota uma arquitetura **modularizada** utilizando **ESM (ECMAScript Modules)**, dividindo as responsabilidades lógicas para facilitar a manutenção e o deploy no NPM.

```
bk-remover/
├── bin/
│   └── cli.js          # 🚪 Ponto de entrada — executável via terminal (shebang)
├── src/
│   ├── parser.ts       # 🔍 Interpretação de argumentos e flags da linha de comando
│   ├── model.ts        # 🧠 Integração com IA local e download do modelo em cache
│   ├── image.ts        # 🖼️  Manipulação de pixels (leitura, resize, máscara e salvamento)
│   └── ui.ts           # 🎨 Feedback visual no terminal (spinners, logs coloridos)
├── dist/               # 📦 Output compilado do TypeScript
├── package.json
└── tsconfig.json
```

### Fluxo de Execução

```
Terminal
   │
   ▼
bin/cli.js  ──►  src/parser.ts  (parse dos argumentos)
                      │
                      ▼
               src/model.ts    (carrega o modelo de IA)
                      │
                      ▼
               src/image.ts    (processa e salva a imagem)
                      │
                      ▼
               src/ui.ts       (feedback visual ao usuário)
```

### Descrição dos Módulos

| Módulo | Responsabilidade |
|---|---|
| `bin/cli.js` | Ponto de entrada do executável. Contém o shebang (`#!/usr/bin/env node`) para o SO identificar o script Node. |
| `src/parser.ts` | Interpretação dos argumentos da CLI usando **Commander.js**. Define flags, opções e validações de entrada. |
| `src/model.ts` | Integração com **@xenova/transformers**. Gerencia o download, cache e inferência do modelo de segmentação. |
| `src/image.ts` | Manipulação de pixels com **Sharp**. Responsável por ler, redimensionar, aplicar a máscara de IA e salvar a imagem final. |
| `src/ui.ts` | Experiência visual no terminal usando **Ora** (spinners) e **Picocolors** (cores e estilos de texto). |

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia | Finalidade |
|---|---|---|
| **Linguagem** | TypeScript | Tipagem estática, DX e segurança de código |
| **Runtime** | Node.js 18+ | Execução do JavaScript no servidor/terminal |
| **Módulos** | ESM | Sistema de módulos moderno do Node |
| **Processamento de Imagem** | [Sharp](https://sharp.pixelplumbing.com/) | Leitura, redimensionamento, máscara e exportação de imagens |
| **Inteligência Artificial** | [@xenova/transformers](https://github.com/xenova/transformers.js) | Execução local de modelos Hugging Face no Node.js |
| **CLI — Parsing** | [Commander.js](https://github.com/tj/commander.js) | Parsing de argumentos e flags da linha de comando |
| **CLI — Spinners** | [Ora](https://github.com/sindresorhus/ora) | Indicadores de progresso elegantes no terminal |
| **CLI — Estilização** | [Picocolors](https://github.com/alexeyraspopov/picocolors) | Logs coloridos e estilizados no terminal |

---

## 📦 Instalação para Desenvolvimento

### Pré-requisitos

- [Node.js](https://nodejs.org/) `>= 18`
- [npm](https://www.npmjs.com/) `>= 9`

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/bk-remover.git
cd bk-remover

# 2. Instale as dependências
npm install

# 3. Execute em modo de desenvolvimento
npm run dev -- foto.jpg
```

### Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Executa a CLI em modo de desenvolvimento via `tsx` |
| `npm run build` | Compila o TypeScript para JavaScript (pasta `dist/`) |
| `npm start` | Executa a versão compilada via `node ./bin/cli.js` |
| `npm run prepack` | Executa o build antes de publicar no NPM |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um **Fork** do projeto
2. Criar uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commitar suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Fazer push para a branch: `git push origin feat/minha-feature`
5. Abrir um **Pull Request**

---

## 📄 Licença

Distribuído sob a licença **ISC**. Veja [`LICENSE`](LICENSE) para mais informações.

---
