import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as ort from 'onnxruntime-node'
import sharp from 'sharp'

import { failSpinner, startSpinner, succeedSpinner } from './ui.js'

const MODEL_PATH = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'models',
    'Xenova',
    'modnet',
    'onnx',
    'model.onnx',
)
const MODEL_SHORT_EDGE = 512
const MODEL_SIZE_DIVISIBILITY = 32

let savedSession: ort.InferenceSession | null = null

export interface ForegroundImage {
    data: Uint8Array | Uint8ClampedArray
    width: number
    height: number
    channels: 4
}

function divisibleSize(value: number): number {
    return Math.max(MODEL_SIZE_DIVISIBILITY, Math.round(value / MODEL_SIZE_DIVISIBILITY) * MODEL_SIZE_DIVISIBILITY)
}

function modelDimensions(width: number, height: number): { width: number; height: number } {
    if (width <= height) {
        return {
            width: MODEL_SHORT_EDGE,
            height: divisibleSize(height * MODEL_SHORT_EDGE / width),
        }
    }

    return {
        width: divisibleSize(width * MODEL_SHORT_EDGE / height),
        height: MODEL_SHORT_EDGE,
    }
}

async function loadModel(): Promise<ort.InferenceSession> {
    if (savedSession) return savedSession

    startSpinner('Loading the local AI model...')

    try {
        savedSession = await ort.InferenceSession.create(MODEL_PATH, {
            executionProviders: ['cpu'],
            graphOptimizationLevel: 'all',
        })
        succeedSpinner('Local model loaded')
        return savedSession
    } catch (error) {
        failSpinner('Could not load the model included with the package')
        throw new Error(
            'The model files are missing or corrupted. Reinstall the package with `npm install offline-background-remover`.',
            { cause: error },
        )
    }
}

function toModelTensor(rgb: Uint8Array, width: number, height: number): ort.Tensor {
    const planeSize = width * height
    const values = new Float32Array(planeSize * 3)

    for (let pixel = 0; pixel < planeSize; pixel += 1) {
        const source = pixel * 3
        values[pixel] = rgb[source]! / 127.5 - 1
        values[planeSize + pixel] = rgb[source + 1]! / 127.5 - 1
        values[planeSize * 2 + pixel] = rgb[source + 2]! / 127.5 - 1
    }

    return new ort.Tensor('float32', values, [1, 3, height, width])
}

function toAlphaMask(values: Float32Array): Uint8Array {
    let requiresSigmoid = false
    for (const value of values) {
        if (value < -1e-5 || value > 1.00001) {
            requiresSigmoid = true
            break
        }
    }

    const alpha = new Uint8Array(values.length)
    for (let index = 0; index < values.length; index += 1) {
        const rawValue = values[index]!
        const normalized = requiresSigmoid ? 1 / (1 + Math.exp(-rawValue)) : rawValue
        alpha[index] = Math.round(Math.min(1, Math.max(0, normalized)) * 255)
    }
    return alpha
}

export async function removeBackground(filePath: string): Promise<ForegroundImage> {
    const session = await loadModel()
    startSpinner(`Detecting the foreground in ${path.basename(filePath)}...`)

    try {
        const original = await sharp(filePath)
            .rotate()
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true })
        const target = modelDimensions(original.info.width, original.info.height)
        const resizedRgb = await sharp(original.data, { raw: original.info })
            .resize(target.width, target.height, { fit: 'fill' })
            .raw()
            .toBuffer()

        const input = toModelTensor(resizedRgb, target.width, target.height)
        const inference = await session.run({ input })
        const output = inference.output

        if (!output || !(output.data instanceof Float32Array)) {
            throw new Error('The AI returned an invalid mask')
        }

        const modelAlpha = toAlphaMask(output.data)
        const resizedAlpha = await sharp(modelAlpha, {
            raw: { width: target.width, height: target.height, channels: 1 },
        })
            .resize(original.info.width, original.info.height, { fit: 'fill' })
            .extractChannel(0)
            .raw()
            .toBuffer({ resolveWithObject: true })

        if (resizedAlpha.info.channels !== 1) {
            throw new Error(`The resized mask returned ${resizedAlpha.info.channels} channels`)
        }

        const alpha = resizedAlpha.data

        const rgba = new Uint8Array(original.info.width * original.info.height * 4)
        for (let pixel = 0; pixel < alpha.length; pixel += 1) {
            const rgbOffset = pixel * 3
            const rgbaOffset = pixel * 4
            rgba[rgbaOffset] = original.data[rgbOffset]!
            rgba[rgbaOffset + 1] = original.data[rgbOffset + 1]!
            rgba[rgbaOffset + 2] = original.data[rgbOffset + 2]!
            rgba[rgbaOffset + 3] = alpha[pixel]!
        }

        succeedSpinner('Background detected')
        return {
            data: rgba,
            width: original.info.width,
            height: original.info.height,
            channels: 4,
        }
    } catch (error) {
        failSpinner(`Could not process ${path.basename(filePath)}`)
        throw error
    }
}
