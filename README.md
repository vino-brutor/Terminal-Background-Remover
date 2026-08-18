<div align="center">

# ✂️ offline-background-remover

**Remove photo backgrounds locally, straight from your terminal.**

```bash
npx offline-background-remover
```

No API, no key, no uploads, and no internet access while processing images.

</div>

## How it works

The package runs an ONNX version of MODNet locally and saves the result as a
transparent PNG. The model (~26 MB) is included in the npm package, so there is
no additional download on the first run.

MODNet is optimized for **portraits and photos of people**. Product, animal, or
landscape images may produce lower-quality results.

## Requirements

- Node.js 22.12 or newer
- Windows, macOS, or Linux on a platform supported by Sharp and ONNX Runtime

## Usage

Run without installing globally:

```bash
npx offline-background-remover
```

When no argument is provided, drag your image into the terminal and press Enter.
You can also pass the image path directly:

```bash
npx offline-background-remover photo.jpg
```

Install globally if you prefer the shorter command:

```bash
npm install --global offline-background-remover
bk-remover photo.jpg
```

By default, `photo.jpg` creates `photo_no_background.png` in the same directory.

### Choose the output file

```bash
npx offline-background-remover photo.jpg --output result.png
```

The output must use the `.png` extension because JPG does not support transparency.

### Process multiple images

```bash
npx offline-background-remover photo1.jpg photo2.png photo3.webp
```

You can also use `*.jpg` in shells that expand wildcards. Each file is processed
independently, so one failure does not stop the remaining images.

### Help

```text
Usage: offline-background-remover [options] [images...]

Arguments:
  images                  one or more jpg, jpeg, png, or webp images

Options:
  -v, --version           output the version number
  -o, --output <file>     output PNG file (only when processing one image)
  -h, --help              display help for command
```

## Privacy and offline use

ONNX Runtime only opens the model weights included with the package. Images and
inference data stay on the user's computer. Once installed, the package can
process images without a network connection.

> `npx` still needs access to the npm registry when the package has not been
> installed or cached yet.

## Development

```bash
npm install
npm run build
npm test
npm run dev -- photo.jpg
```

Main files:

```text
bin/cli.js                         executable that loads dist/index.js
src/index.ts                       arguments, validation, and batch processing
src/model.ts                       local model loading and inference
src/images.ts                      RGBA buffer export to PNG
src/ui.ts                          terminal messages and spinners
models/Xenova/modnet/              ONNX model configuration and weights
tests/                             unit and offline integration tests
```

The `prepack` script compiles TypeScript before packaging or publishing.

## Model and license

This project's code is licensed under ISC. The bundled MODNet model is distributed
under Apache-2.0. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
