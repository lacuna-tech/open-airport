import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { NavBreadcrumbs } from './NavBreadcrumbs'

const meta: ComponentMeta<typeof NavBreadcrumbs> = {
  title: 'Navigation/NavBreadcumbs',
  component: NavBreadcrumbs,
  args: {
    breadcrumbs: [
      { title: 'Link 1', href: '/link1' },
      { title: 'Link 2', href: '/link2' }
    ]
  }
}

export default meta

const Template: ComponentStory<typeof NavBreadcrumbs> = args => {
  return (
    <NavBreadcrumbs
      {...{
        ...args,
        currentLinkTitle: 'Current Page'
      }}
    />
  )
}

export const Default = Template.bind({})
export const Collapsed = Template.bind({})
Collapsed.args = {
  breadcrumbs: [
    { title: 'Link 1', href: '/link1' },
    { title: 'Link 2', href: '/link2' },
    { title: 'Link 3', href: '/link3' },
    { title: 'Link 4', href: '/link4' }
  ]
}
export const LongLinkTitles = Template.bind({})
LongLinkTitles.args = {
  breadcrumbs: [
    { title: 'Link 1', href: '/link1' },
    { title: 'Really Long Link Title Goes Here', href: '/link2' }
  ],
  maxBreadcrumbWidth: [200, 300]
}
