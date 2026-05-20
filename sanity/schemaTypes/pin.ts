import { defineField, defineType } from 'sanity'
import { VideoWithPosterInput } from '../components/VideoWithPosterInput'

export const pin = defineType({
  name: 'pin',
  title: 'Pin',
  type: 'document',
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Text note', value: 'text' },
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
          { title: 'Link', value: 'link' },
        ],
        layout: 'radio',
      },
      initialValue: 'text',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'content',
      title: 'Text',
      type: 'text',
      rows: 3,
      hidden: ({ parent }) => parent?.kind !== 'text',
      validation: (r) =>
        r.custom((value, ctx) => {
          const kind = (ctx.parent as { kind?: string } | undefined)?.kind
          if (kind === 'text' && !value) return 'Text is required for text pins'
          return true
        }),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind !== 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
      validation: (r) =>
        r.custom((value, ctx) => {
          const kind = (ctx.parent as { kind?: string } | undefined)?.kind
          if (kind === 'image' && !value) return 'Image is required for image pins'
          return true
        }),
    }),

    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.kind !== 'video',
      components: {
        input: VideoWithPosterInput,
      },
      validation: (r) =>
        r.custom((value, ctx) => {
          const kind = (ctx.parent as { kind?: string } | undefined)?.kind
          if (kind === 'video' && !value) return 'Video is required for video pins'
          return true
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Poster (auto-generated)',
      description: 'First frame of the video. Generated automatically on upload.',
      type: 'image',
      hidden: ({ parent }) => parent?.kind !== 'video',
      readOnly: true,
    }),

    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({ parent }) => parent?.kind !== 'link',
      validation: (r) =>
        r.custom((value, ctx) => {
          const kind = (ctx.parent as { kind?: string } | undefined)?.kind
          if (kind === 'link' && !value) return 'URL is required for link pins'
          return true
        }),
    }),
    defineField({
      name: 'linkTitle',
      title: 'Link title',
      type: 'string',
      hidden: ({ parent }) => parent?.kind !== 'link',
    }),

    defineField({
      name: 'rotation',
      title: 'Rotation (deg)',
      type: 'number',
      initialValue: 0,
      validation: (r) => r.required().min(-180).max(180),
    }),
    defineField({
      name: 'scale',
      title: 'Scale',
      type: 'number',
      initialValue: 1,
      validation: (r) => r.required().min(0.3).max(2.5),
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured pins render on top of others',
      initialValue: false,
    }),
    defineField({
      name: 'postedAt',
      title: 'Posted at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      kind: 'kind',
      content: 'content',
      linkTitle: 'linkTitle',
      url: 'url',
      image: 'image',
      postedAt: 'postedAt',
    },
    prepare({ kind, content, linkTitle, url, image, postedAt }) {
      const date = postedAt ? new Date(postedAt).toLocaleDateString() : ''
      const title =
        kind === 'text'
          ? content?.slice(0, 60) || 'Text pin'
          : kind === 'link'
            ? linkTitle || url || 'Link'
            : kind === 'image'
              ? 'Image'
              : kind === 'video'
                ? 'Video'
                : 'Pin'
      return {
        title,
        subtitle: `${kind}${date ? ` · ${date}` : ''}`,
        media: kind === 'image' ? image : undefined,
      }
    },
  },
  orderings: [
    {
      title: 'Newest',
      name: 'postedAtDesc',
      by: [{ field: 'postedAt', direction: 'desc' }],
    },
    {
      title: 'Oldest',
      name: 'postedAtAsc',
      by: [{ field: 'postedAt', direction: 'asc' }],
    },
  ],
})
