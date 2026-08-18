import path from 'node:path'
import sharp from 'sharp'

import type { ForegroundImage } from './model.js'
import { failSpinner, startSpinner, succeedSpinner } from './ui.js'

export function defaultOutputPath(inputPath: string): string {
    const parsedPath = path.parse(inputPath)
    return path.join(parsedPath.dir, `${parsedPath.name}_no_background.png`)
}

export async function processAndSaveImage(
    originalFilePath: string,
    foreground: ForegroundImage,
    requestedOutputPath?: string,
): Promise<string> {
    const outputPath = path.resolve(requestedOutputPath ?? defaultOutputPath(originalFilePath))

    if (path.extname(outputPath).toLowerCase() !== '.png') {
        throw new Error('The output file must use the .png extension to preserve transparency.')
    }

    startSpinner('Applying transparency and saving the PNG...')

    try {
        await sharp(Buffer.from(foreground.data), {
            raw: {
                width: foreground.width,
                height: foreground.height,
                channels: foreground.channels,
            },
        }).png().toFile(outputPath)

        succeedSpinner(`Image saved to ${outputPath}`)
        return outputPath
    } catch (error) {
        failSpinner('Could not save the image')
        throw error
    }
}
