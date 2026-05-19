import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'bola loves dan',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'spotifyPlaylistId',
      title: 'Spotify playlist ID',
      description:
        'Just the ID from the playlist URL — e.g. 37i9dQZF1DXcBWIGoYBM5M',
      type: 'string',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
