import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sermon',
  title: 'Sunday messages',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Message title',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'speaker',
      title: 'Who preached',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date preached',
      type: 'date',
      options: {dateFormat: 'MMMM D, YYYY'},
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link',
      type: 'url',
      description: 'Paste the YouTube or Facebook link. Leave blank if there is no video.',
    }),
    defineField({
      name: 'scripture',
      title: 'Scripture',
      type: 'string',
      description: 'Optional. For example: John 4:1-26',
    }),
    defineField({
      name: 'description',
      title: 'What it was about',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'speaker', media: 'photo'},
  },
})
