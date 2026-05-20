import { createClient } from '@sanity/client'
import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream, promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error('Missing env vars (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN)')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-05-20',
  token,
  useCdn: false,
})

type Pin = {
  _id: string
  videoUrl?: string
  hasPoster: boolean
}

async function main() {
  const pins = await client.fetch<Pin[]>(`
    *[_type == "pin" && kind == "video"]{
      _id,
      "videoUrl": video.asset->url,
      "hasPoster": defined(poster.asset)
    }
  `)

  const missing = pins.filter((p) => !p.hasPoster && p.videoUrl)
  if (missing.length === 0) {
    console.log('All video pins already have posters. Nothing to do.')
    return
  }

  console.log(`Found ${missing.length} video pin(s) without posters.`)

  for (const pin of missing) {
    try {
      console.log(`\n· ${pin._id}`)
      await backfillOne(pin)
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : err}`)
    }
  }
}

async function backfillOne(pin: Pin) {
  if (!pin.videoUrl) throw new Error('no video URL')
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'poster-'))
  const videoPath = join(tmpDir, 'in.mp4')
  const posterPath = join(tmpDir, 'out.jpg')

  try {
    console.log('  ↓ downloading video')
    await downloadTo(pin.videoUrl, videoPath)

    console.log('  ⌗ extracting frame with ffmpeg')
    await runFfmpeg(videoPath, posterPath)

    console.log('  ↑ uploading poster to Sanity')
    const asset = await client.assets.upload('image', createReadStream(posterPath), {
      filename: 'poster.jpg',
      contentType: 'image/jpeg',
    })

    console.log('  ⟳ patching pin')
    await client
      .patch(pin._id)
      .set({
        poster: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      })
      .commit()

    console.log('  ✓ done')
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

async function downloadTo(url: string, dest: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status} ${res.statusText}`)
  if (!res.body) throw new Error('empty body')
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest))
}

function runFfmpeg(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'ffmpeg',
      ['-y', '-ss', '0.1', '-i', input, '-frames:v', '1', '-q:v', '2', output],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    )
    let stderr = ''
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`))
    })
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
