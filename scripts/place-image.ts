import { createClient } from '@sanity/client'

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

async function main() {
  const pins = await client.fetch<{ _id: string; content?: string }[]>(
    `*[_type == "pin" && kind == "image"]{ _id, content }`,
  )
  if (pins.length === 0) {
    console.log('No image pins found. Add one in Studio and publish first.')
    return
  }
  if (pins.length > 1) {
    console.log(`Found ${pins.length} image pins. Updating all of them:`)
  }

  const tx = client.transaction()
  for (const p of pins) {
    tx.patch(p._id, { set: { x: 82, y: 26, rotation: 90 } })
  }
  const res = await tx.commit()
  console.log(`Patched ${res.results.length} pin(s):`)
  res.results.forEach((r) => console.log(`  · ${r.id}`))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
