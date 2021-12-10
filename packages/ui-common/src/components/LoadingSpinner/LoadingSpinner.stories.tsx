import React from 'react'
import { Meta, Story } from '@storybook/react'

import LoadingSpinner, { LoadingSpinnerProps } from './LoadingSpinner'

const meta: Meta<LoadingSpinnerProps> = {
  title: 'LoadingSpinner',
  component: LoadingSpinner
}
export default meta

const Template: Story<LoadingSpinnerProps> = args => <LoadingSpinner {...args} />

export const Default = Template.bind({})

export const WithMessage = Template.bind({})
WithMessage.args = {
  message: 'Loading all the things'
}

export const Compact = Template.bind({})
Compact.args = {
  message: 'Loading more stuff',
  compact: true
}
