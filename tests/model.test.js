import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

import { removeBackground } from '../dist/model.js'

test('bundled model runs locally and returns a same-size RGBA image', { timeout: 60_000 }, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'offline-background-remover-model-'))
    const input = path.join(directory, 'input.png')

    try {
        await sharp({
            create: {
                width: 64,
                height: 48,
                channels: 3,
                background: { r: 240, g: 240, b: 240 },
            },
        }).png().toFile(input)

        const result = await removeBackground(input)
        assert.equal(result.width, 64)
        assert.equal(result.height, 48)
        assert.equal(result.channels, 4)
        assert.equal(result.data.length, 64 * 48 * 4)
    } finally {
        await rm(directory, { recursive: true, force: true })
    }
})
