import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID'

export default defineConfig({
  name: 'i-am-church',
  title: 'I AM Church',

  projectId: PROJECT_ID,
  dataset: 'production',

  plugins: [
    structureTool({
      // A deliberately short, plain-language menu. "Service times & announcement"
      // is a single page rather than a list, so there is never a "create new" step
      // for something there is only ever one of.
      structure: (S) =>
        S.list()
          .title('I AM Church')
          .items([
            S.documentTypeListItem('event').title('Events'),
            S.documentTypeListItem('sermon').title('Sunday messages'),
            S.documentTypeListItem('group').title('Groups'),
            S.documentTypeListItem('galleryAlbum').title('Photo albums'),
            S.divider(),
            S.listItem()
              .title('Service times & announcement')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Service times & announcement')
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
    // Only one settings document should ever exist, so keep it out of
    // the global "create new" menu.
    templates: (prev) => prev.filter((t) => t.schemaType !== 'siteSettings'),
  },
})
