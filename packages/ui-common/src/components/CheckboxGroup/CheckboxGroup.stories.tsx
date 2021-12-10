import React from 'react'
import { Meta, Story } from '@storybook/react'

import { CheckboxGroupProps } from '../../types'
import CheckboxGroup from './CheckboxGroup'

const meta: Meta<CheckboxGroupProps> = {
  title: 'CheckboxGroup',
  component: CheckboxGroup,
  args: {
    options: [
      {
        id: 'one',
        name: 'One',
        checked: true
      },
      {
        id: 'two',
        name: 'Two',
        checked: false
      },
      {
        id: 'three',
        name: 'Three',
        checked: true
      }
    ]
  }
}
export default meta

const Template: Story<CheckboxGroupProps> = (args: CheckboxGroupProps) => <CheckboxGroup {...args} />

export const Default = Template.bind({})
