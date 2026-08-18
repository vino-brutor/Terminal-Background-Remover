import { createInterface } from 'node:readline/promises'
import ora, { type Ora } from 'ora'
import pc from 'picocolors'

let activeSpinner: Ora | null = null

export function startSpinner(message: string): void {
    activeSpinner?.stop()
    activeSpinner = ora(message).start()
}

export function succeedSpinner(message: string): void {
    activeSpinner?.succeed(pc.green(message))
    activeSpinner = null
}

export function failSpinner(message: string): void {
    activeSpinner?.fail(pc.red(message))
    activeSpinner = null
}

export function info(message: string): void {
    console.log(message)
}

export function success(message: string): void {
    console.log(pc.green(message))
}

export function error(message: string): void {
    console.error(pc.red(message))
}

export function normalizeDroppedPath(value: string): string {
    const trimmed = value.trim()
    const hasMatchingQuotes = (
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
        || (trimmed.startsWith("'") && trimmed.endsWith("'"))
    )

    return hasMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed
}

export async function askForImagePath(): Promise<string> {
    info('No image was provided.')
    console.log(pc.yellow('Drag an image into this terminal and press Enter.'))

    const prompt = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    try {
        const answer = await prompt.question('Image path: ')
        const filePath = normalizeDroppedPath(answer)

        if (!filePath) {
            throw new Error('No image was selected. Run the command again and drag an image into the terminal.')
        }

        return filePath
    } finally {
        prompt.close()
    }
}
