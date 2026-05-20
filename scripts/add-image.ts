import { createClient } from '@sanity/client'
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error('Missing env vars (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN)')
}

const [, , filePath, xArg, yArg, rotationArg, scaleArg, altArg] = process.argv
if (!filePath) {
  console.error('Usage: tsx scripts/add-image.ts <path> [x] [y] [rotation] [scale] [alt]')
  process.exit(1)
}

const x = xArg ? Number(xArg) : 50
const y = yArg ? Number(yArg) : 50
const rotation = rotationArg ? Number(rotationArg) : 0
const scale = scaleArg ? Number(scaleArg) : 1
const alt = altArg ?? basename(filePath)

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-05-20',
  token,
  useCdn: false,
})

async function main() {
  console.log(`Uploading ${filePath} ...`)
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename: basename(filePath),
  })
  console.log(`  → asset ${asset._id}`)

  const doc = await client.create({
    _type: 'pin',
    kind: 'image',
    image: {
      _type: 'image',
      alt,
      asset: { _type: 'reference', _ref: asset._id },
    },
    x,
    y,
    rotation,
    scale,
    featured: false,
    postedAt: new Date().toISOString(),
  })
  console.log(`Created pin ${doc._id} at x=${x} y=${y} rot=${rotation} scale=${scale}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
