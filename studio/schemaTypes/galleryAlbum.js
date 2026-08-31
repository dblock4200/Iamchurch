import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'galleryAlbum',
  title: 'Photo albums',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Album name',
      type: 'string',
      description: 'For example: Fall Picnic 2026',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      description: 'Drag photos in from your phone or computer. You can add many at once.',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional.',
            },
          ],
        },
      ],
      options: {layout: 'grid'},
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'date', media: 'photos.0'},
  },
})
