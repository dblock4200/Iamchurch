import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'group',
  title: 'Groups',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Group name',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Connections', value: 'connections'},
          {title: 'Men', value: 'men'},
          {title: 'Women', value: 'women'},
          {title: 'Young Adults', value: 'ya'},
          {title: 'Kids', value: 'kids'},
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Labels',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Short labels shown on the card. For example: All ages, Weekly.',
    }),
    defineField({
      name: 'location',
      title: 'Where it meets',
      type: 'string',
    }),
    defineField({
      name: 'leader',
      title: 'Who leads it',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Open or full?',
      type: 'string',
      options: {
        list: [
          {title: 'Open', value: 'Open'},
          {title: 'Full', value: 'Full'},
        ],
        layout: 'radio',
      },
      initialValue: 'Open',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'signupUrl',
      title: 'Sign-up link',
      type: 'url',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'leader', media: 'photo'},
  },
})
