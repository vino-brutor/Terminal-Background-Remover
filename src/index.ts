import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'

import { processAndSaveImage } from './images.js'
import { removeBackground } from './model.js'
import { askForImagePath, error, info, success } from './ui.js'

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const PACKAGE_VERSION = (JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }).version

interface CliOptions {
    output?: string
}

function validateInput(filePath: string): string {
    const absolutePath = path.resolve(filePath)

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
        throw new Error(`File not found: ${filePath}. Check the path and try again.`)
    }

    const extension = path.extname(absolutePath).toLowerCase()
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
        throw new Error(`Unsupported format ${extension || '(no extension)'}. Use jpg, jpeg, png, or webp.`)
    }

    return absolutePath
}

async function processOne(inputPath: string, outputPath?: string): Promise<string> {
    const absoluteInputPath = validateInput(inputPath)
    const foreground = await removeBackground(absoluteInputPath)
    return processAndSaveImage(absoluteInputPath, foreground, outputPath)
}

export async function run(argv = process.argv): Promise<void> {
    const program = new Command()

    program
        .name('offline-background-remover')
        .description('Remove photo backgrounds locally, without an API or internet access')
        .version(PACKAGE_VERSION, '-v, --version')
        .argument('[images...]', 'one or more jpg, jpeg, png, or webp images')
        .option('-o, --output <file>', 'output PNG file (only when processing one image)')
        .action(async (images: string[] = [], options: CliOptions) => {
            const selectedImages = images.length > 0 ? images : [await askForImagePath()]

            if (options.output && selectedImages.length !== 1) {
                throw new Error('--output can only be used when processing a single image.')
            }

            let succeeded = 0
            let failed = 0

            for (const [index, image] of selectedImages.entries()) {
                if (selectedImages.length > 1) info(`[${index + 1}/${selectedImages.length}] ${image}`)

                try {
                    await processOne(image, options.output)
                    succeeded += 1
                } catch (processingError) {
                    failed += 1
                    const message = processingError instanceof Error ? processingError.message : String(processingError)
                    error(`Failed to process ${image}: ${message}`)
                }
            }

            if (failed === 0) {
                success(`${succeeded} image(s) processed successfully.`)
                return
            }

            error(`Summary: ${succeeded} completed, ${failed} failed.`)
            process.exitCode = 1
        })

    await program.parseAsync(argv)
}

run().catch((runError: unknown) => {
    const message = runError instanceof Error ? runError.message : String(runError)
    error(`Error: ${message}`)
    process.exitCode = 1
})
