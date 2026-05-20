import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET in .env.local',
  )
}
if (!token) {
  throw new Error(
    'Missing SANITY_API_WRITE_TOKEN in .env.local. Generate one at sanity.io/manage with Editor permission.',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-05-20',
  token,
  useCdn: false,
})

type SeedPin = {
  slug: string
  content: string
  x: number
  y: number
  rotation: number
  scale: number
}

const pins: SeedPin[] = [
  { slug: 'bdzd', content: 'BDZD', x: 28, y: 38, rotation: -7, scale: 1.1 },
  { slug: 'claude', content: 'Claude', x: 68, y: 32, rotation: 5, scale: 0.95 },
  { slug: 'morning-runs', content: 'Morning Runs', x: 38, y: 62, rotation: 3, scale: 1.0 },
  { slug: 'cafe-clock', content: 'Café Clock', x: 72, y: 58, rotation: -5, scale: 1.05 },
]

async function main() {
  const now = Date.now()
  const tx = client.transaction()
  pins.forEach((p, i) => {
    tx.createOrReplace({
      _id: `seed-pin-${p.slug}`,
      _type: 'pin',
      kind: 'text',
      content: p.content,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      scale: p.scale,
      featured: false,
      postedAt: new Date(now - (pins.length - i) * 1000).toISOString(),
    })
  })
  const res = await tx.commit()
  console.log(`Seeded ${res.results.length} pins:`)
  res.results.forEach((r) => console.log(`  · ${r.id} (${r.operation})`))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
