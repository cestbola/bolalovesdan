'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

const SINGLETON_TYPES = new Set(['siteSettings'])

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((t) => !SINGLETON_TYPES.has(t.templateId))
        : prev,
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(
            ({ action }) =>
              action !== 'unpublish' &&
              action !== 'delete' &&
              action !== 'duplicate',
          )
        : prev,
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
