import React from 'react'
import { Meta, Story } from '@storybook/react'

import ControlledCheckboxGroup, { ControlledCheckboxGroupProps } from './ControlledCheckboxGroup'

const meta: Meta<ControlledCheckboxGroupProps> = {
  title: 'ControlledCheckboxGroup',
  component: ControlledCheckboxGroup,
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

const Template: Story<ControlledCheckboxGroupProps> = args => <ControlledCheckboxGroup {...args} />

export const Default = Template.bind({})
