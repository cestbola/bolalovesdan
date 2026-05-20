import 'server-only'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import type { Item, Settings } from './types'

const DEFAULT_SETTINGS: Settings = {
  spotifyPlaylistId: null,
  heading: 'bola loves dan',
  subheading: '',
}

type RawPin = {
  _id: string
  kind: 'text' | 'image' | 'video' | 'link'
  content?: string
  image?: {
    alt?: string
    asset?: {
      _id?: string
      _ref?: string
      metadata?: { dimensions?: { width: number; height: number } }
    }
  }
  videoUrl?: string
  posterUrl?: string
  url?: string
  linkTitle?: string
  rotation?: number
  scale?: number
  featured?: boolean
  postedAt?: string
}

const PINS_QUERY = /* groq */ `
  *[_type == "pin"] | order(featured desc, postedAt desc) {
    _id,
    kind,
    content,
    image{ alt, asset->{ _id, metadata { dimensions } } },
    "videoUrl": video.asset->url,
    "posterUrl": poster.asset->url,
    url,
    linkTitle,
    rotation, scale,
    featured, postedAt
  }
`

const SETTINGS_QUERY = /* groq */ `
  *[_id == "siteSettings"][0]{
    heading, subheading, spotifyPlaylistId
  }
`

function toItem(p: RawPin): Item | null {
  const base = {
    id: p._id,
    rotation: p.rotation ?? 0,
    scale: p.scale ?? 1,
    featured: p.featured ?? false,
    postedAt: p.postedAt ?? new Date(0).toISOString(),
  }

  switch (p.kind) {
    case 'text':
      if (!p.content) return null
      return { ...base, type: 'text', content: p.content }
    case 'link':
      if (!p.url) return null
      return {
        ...base,
        type: 'link',
        url: p.url,
        title: p.linkTitle ?? '',
      }
    case 'image': {
      const assetId = p.image?.asset?._id ?? p.image?.asset?._ref
      if (!assetId) return null
      const dims = p.image?.asset?.metadata?.dimensions
      const src = urlFor({ _type: 'image', asset: { _ref: assetId } })
        .width(640)
        .fit('max')
        .auto('format')
        .url()
      return {
        ...base,
        type: 'image',
        src,
        alt: p.image?.alt ?? '',
        width: dims?.width ?? 0,
        height: dims?.height ?? 0,
      }
    }
    case 'video':
      if (!p.videoUrl) return null
      return { ...base, type: 'video', src: p.videoUrl, poster: p.posterUrl }
    default:
      return null
  }
}

export async function readItems(): Promise<Item[]> {
  const raw = await client.fetch<RawPin[]>(
    PINS_QUERY,
    {},
    { next: { revalidate: 60, tags: ['pins'] } },
  )
  return raw.map(toItem).filter((x): x is Item => x !== null)
}

export async function readSettings(): Promise<Settings> {
  const raw = await client.fetch<Partial<Settings> | null>(
    SETTINGS_QUERY,
    {},
    { next: { revalidate: 60, tags: ['siteSettings'] } },
  )
  return {
    ...DEFAULT_SETTINGS,
    ...(raw ?? {}),
    spotifyPlaylistId: raw?.spotifyPlaylistId || null,
  }
}
