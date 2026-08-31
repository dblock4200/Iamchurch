import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event name',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Date and time',
      type: 'datetime',
      description: 'When the event starts. Past events drop off the website automatically.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'location',
      title: 'Where is it?',
      type: 'string',
      description: 'For example: Church lot, Room 2, or an address.',
    }),
    defineField({
      name: 'ministry',
      title: 'Ministry',
      type: 'string',
      options: {
        list: [
          'Compassion', 'Worship', 'Next Steps', 'Kids', 'Small Groups',
          'Men', 'Women', 'Young Adults', 'Missions', 'Prayer',
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Show under these filters',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Event', value: 'event'},
          {title: 'Groups', value: 'groups'},
          {title: 'Sign-ups', value: 'signups'},
          {title: 'Volunteer', value: 'volunteer'},
          {title: 'Featured', value: 'featured'},
        ],
      },
      initialValue: ['event'],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional. Sideways phone photos are fine — they get straightened and cropped.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'signupUrl',
      title: 'Sign-up link',
      type: 'url',
      description: 'Optional. A form or page people go to to sign up.',
    }),
  ],
  orderings: [
    {title: 'Soonest first', name: 'startsAtAsc', by: [{field: 'startsAt', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'startsAt', media: 'photo'},
  },
})
