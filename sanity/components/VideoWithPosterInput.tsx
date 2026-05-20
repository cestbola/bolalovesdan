import { useEffect, useRef, useState } from 'react'
import {
  type FileValue,
  type ObjectInputProps,
  useClient,
  useFormValue,
} from 'sanity'

type Props = ObjectInputProps<FileValue>

const POSTER_FIELD = 'poster'

export function VideoWithPosterInput(props: Props) {
  const client = useClient({ apiVersion: '2026-05-20' })
  const docId = useFormValue(['_id']) as string | undefined
  const existingPoster = useFormValue([POSTER_FIELD]) as { asset?: unknown } | undefined
  const videoAssetRef = props.value?.asset?._ref
  const processedRef = useRef<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!videoAssetRef || !docId) return
    if (existingPoster?.asset) return
    if (processedRef.current === videoAssetRef) return
    processedRef.current = videoAssetRef

    let cancelled = false
    setStatus('working')
    setErrorMsg(null)

    ;(async () => {
      try {
        const asset = await client.fetch<{ url?: string } | null>(
          `*[_id == $id][0]{url}`,
          { id: videoAssetRef },
        )
        if (!asset?.url) throw new Error('Video asset URL unavailable')

        const blob = await extractFirstFrame(asset.url)
        if (cancelled) return
        if (!blob) throw new Error('Could not extract frame')

        const imageAsset = await client.assets.upload('image', blob, {
          filename: 'poster.jpg',
          contentType: 'image/jpeg',
        })
        if (cancelled) return

        await client
          .patch(docId)
          .set({
            [POSTER_FIELD]: {
              _type: 'image',
              asset: { _type: 'reference', _ref: imageAsset._id },
            },
          })
          .commit()

        if (!cancelled) setStatus('done')
      } catch (err) {
        if (cancelled) return
        console.error('[poster extraction]', err)
        setErrorMsg(err instanceof Error ? err.message : 'unknown error')
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [videoAssetRef, docId, existingPoster?.asset, client])

  return (
    <div>
      {props.renderDefault(props)}
      {status !== 'idle' ? (
        <div style={{ marginTop: 8, fontSize: 12, color: status === 'error' ? '#f87171' : '#9ca3af' }}>
          {status === 'working' && 'Extracting first frame for poster…'}
          {status === 'done' && 'Poster generated.'}
          {status === 'error' && `Poster extraction failed: ${errorMsg}`}
        </div>
      ) : null}
    </div>
  )
}

async function extractFirstFrame(url: string): Promise<Blob | null> {
  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url

  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('video load failed'))
    }
    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('error', onError)
  })

  if (video.readyState < 2) {
    await new Promise<void>((resolve) => {
      const onCanPlay = () => {
        video.removeEventListener('canplay', onCanPlay)
        resolve()
      }
      video.addEventListener('canplay', onCanPlay)
    })
  }

  // Seek slightly past 0 to ensure a decoded frame is available.
  await new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('seek failed'))
    }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = Math.min(0.1, (video.duration || 1) * 0.05)
  })

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0)

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
  })
}
