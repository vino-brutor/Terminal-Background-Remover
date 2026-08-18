import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

function runInteractiveCli(droppedPath) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['./bin/cli.js'], {
            cwd: process.cwd(),
            env: { ...process.env, NO_COLOR: '1' },
            stdio: ['pipe', 'pipe', 'pipe'],
        })
        let output = ''

        child.stdout.on('data', chunk => { output += chunk })
        child.stderr.on('data', chunk => { output += chunk })
        child.on('error', reject)
        child.on('close', code => resolve({ code, output }))
        child.stdin.end(`"${droppedPath}"\n`)
    })
}

test('CLI asks for a dragged image when no argument is provided', { timeout: 60_000 }, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'offline-background-remover-cli-'))
    const input = path.join(directory, 'photo with spaces.png')
    const output = path.join(directory, 'photo with spaces_no_background.png')

    try {
        await sharp({
            create: {
                width: 64,
                height: 48,
                channels: 3,
                background: { r: 240, g: 240, b: 240 },
            },
        }).png().toFile(input)

        const result = await runInteractiveCli(input)
        assert.equal(result.code, 0, result.output)
        assert.match(result.output, /Drag an image/)

        const metadata = await sharp(output).metadata()
        assert.equal(metadata.width, 64)
        assert.equal(metadata.height, 48)
        assert.equal(metadata.channels, 4)
    } finally {
        await rm(directory, { recursive: true, force: true })
    }
})
