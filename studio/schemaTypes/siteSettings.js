import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Service times & announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'weekendKicker',
      title: 'Small line above the heading',
      type: 'string',
      initialValue: 'This weekend',
    }),
    defineField({
      name: 'weekendStatement',
      title: 'Big heading',
      type: 'string',
      description: 'Use a line break where you want the text to wrap.',
      initialValue: 'One gathering, wide open.',
    }),
    defineField({
      name: 'weekendLede',
      title: 'Paragraph under the heading',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'serviceTimes',
      title: 'Service times',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string', description: 'For example: Sunday, or Where'},
            {name: 'value', title: 'Value', type: 'string', description: 'For example: 2:00 PM, or Glendale, AZ'},
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        },
      ],
    }),
    defineField({
      name: 'announcementActive',
      title: 'Show the announcement bar?',
      type: 'boolean',
      description: 'Turn this on to show a notice across the top of every page.',
      initialValue: false,
    }),
    defineField({
      name: 'announcementText',
      title: 'Announcement',
      type: 'string',
      description: 'Keep it short — one sentence.',
    }),
    defineField({
      name: 'announcementLinkUrl',
      title: 'Announcement link',
      type: 'url',
      description: 'Optional. Where the announcement should send people.',
    }),
    defineField({
      name: 'announcementLinkLabel',
      title: 'Link wording',
      type: 'string',
      description: 'Optional. For example: Sign up',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Service times & announcement'}),
  },
})
