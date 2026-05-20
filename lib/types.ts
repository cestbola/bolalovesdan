export type ItemBase = {
  id: string
  rotation: number
  scale: number
  featured: boolean
  postedAt: string
}

export type ImageItem = ItemBase & {
  type: 'image'
  src: string
  alt: string
  width: number
  height: number
}

export type TextItem = ItemBase & {
  type: 'text'
  content: string
}

export type LinkItem = ItemBase & {
  type: 'link'
  url: string
  title: string
}

export type VideoItem = ItemBase & {
  type: 'video'
  src: string
  poster?: string
}

export type Item = ImageItem | TextItem | LinkItem | VideoItem

export type Settings = {
  spotifyPlaylistId: string | null
  heading: string
  subheading: string
}
