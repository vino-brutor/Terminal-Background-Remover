import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

import { defaultOutputPath, processAndSaveImage } from '../dist/images.js'

test('defaultOutputPath uses the documented PNG name', () => {
    assert.equal(defaultOutputPath(path.join('photos', 'portrait.jpg')), path.join('photos', 'portrait_no_background.png'))
})

test('processAndSaveImage writes RGBA without changing dimensions', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'offline-background-remover-'))
    const output = path.join(directory, 'result.png')

    try {
        await processAndSaveImage('unused.jpg', {
            data: new Uint8Array([
                255, 0, 0, 0,
                0, 255, 0, 255,
            ]),
            width: 2,
            height: 1,
            channels: 4,
        }, output)

        const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true })
        assert.equal(info.width, 2)
        assert.equal(info.height, 1)
        assert.equal(info.channels, 4)
        assert.deepEqual([...data], [255, 0, 0, 0, 0, 255, 0, 255])
    } finally {
        await rm(directory, { recursive: true, force: true })
    }
})

test('processAndSaveImage rejects formats without transparency', async () => {
    await assert.rejects(
        processAndSaveImage('unused.jpg', {
            data: new Uint8Array([0, 0, 0, 0]),
            width: 1,
            height: 1,
            channels: 4,
        }, 'result.jpg'),
        /\.png extension/,
    )
})
