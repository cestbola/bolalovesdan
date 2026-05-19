import type { StructureResolver } from 'sanity/structure'

const SETTINGS_ID = 'siteSettings'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId(SETTINGS_ID)
            .title('Site settings'),
        ),
      S.divider(),
      S.documentTypeListItem('pin').title('Pins'),
    ])
