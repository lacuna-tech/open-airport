import React from 'react'
import DashboardIcon from '@material-ui/icons/Dashboard'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router'

import PageMenu, { PageMenuProps } from './PageMenu'

const meta: Meta<PageMenuProps> = {
  title: 'PageMenu',
  component: PageMenu,
  decorators: [
    StoryComp => (
      <MemoryRouter initialEntries={['/page1', '/page2']} initialIndex={1}>
        <StoryComp />
      </MemoryRouter>
    )
  ],
  args: {
    pages: [
      { menuTitle: 'Page 1', path: '/page1', icon: <DashboardIcon /> },
      { menuTitle: 'Page 2', path: '/page2', icon: <DashboardIcon /> }
    ]
  }
}
export default meta

const Template: Story<PageMenuProps> = args => <PageMenu {...args} />

export const Default = Template.bind({})
