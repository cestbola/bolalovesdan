import { type SchemaTypeDefinition } from 'sanity'

import { pin } from './pin'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [pin, siteSettings],
}
