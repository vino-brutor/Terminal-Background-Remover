import ora from 'ora'
import { pipeline, env } from '@xenova/transformers'

let savedModel: pipeline | null = null

export async function loadModel(): pipeline {
    if (savedModel) return savedModel

    const spinner = ora('Loading background remover model...').start()

    try {
        savedModel = await pipeline('image-segmentation', 'briaai/RMBG-1.4')

        spinner.succeed('Background remover model loaded successfully!')

        return savedModel
    }
    catch (error) {
        spinner.fail('Failed to load background remover model!')
        throw error
    }
}

export async function removeBackgroud(filePath: string) {
    const model = await loadModel()

    const spinner = ora("Processing image...").start()

    try {
        const result = await model(filePath)

        spinner.succeed("Background identified")

        return result
    }
    catch (error) {
        spinner.fail('Failed processing the image!')
        throw error
    }
}

