import React from 'react'
import Box from '@material-ui/core/Box'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDotCircle } from '@fortawesome/pro-solid-svg-icons'
import { Meta, Story } from '@storybook/react'

import { FilterCard, FilterCardTitle } from '.'
import { FilterCardProps } from './FilterCard'

const meta: Meta<FilterCardProps> = {
  title: 'FilterCard',
  component: FilterCard,
  decorators: [
    StoryComp => (
      <div style={{ maxWidth: 300 }}>
        <StoryComp />
      </div>
    )
  ],
  args: {
    header: 'Card Title'
  }
}
export default meta

const Template: Story<FilterCardProps> = args => <FilterCard {...args}>Card content</FilterCard>

export const Default = Template.bind({})

export const WithIcon = Template.bind({})
WithIcon.args = {
  icon: <FontAwesomeIcon icon={faDotCircle} />
}

export const WithCustomHeader = Template.bind({})
WithCustomHeader.args = {
  icon: <FontAwesomeIcon icon={faDotCircle} />,
  header: (
    <Box flex={1} display='flex' alignItems='center'>
      <FilterCardTitle>Custom Header</FilterCardTitle>
      <Box flex={1} />
      <input type='checkbox' />
    </Box>
  )
}
