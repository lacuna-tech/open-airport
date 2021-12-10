/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { Form } from 'react-final-form'

import CheckboxArray, { CheckboxArrayProps } from './CheckboxArray'

const meta: Meta<CheckboxArrayProps> = {
  title: 'CheckboxArray',
  component: CheckboxArray,
  args: {
    label: 'A-B-C',
    options: ['a', 'b', 'c'],
    name: 'array'
  }
}
export default meta

const Template: Story<CheckboxArrayProps & { initialValue?: string | string[] }> = ({
  initialValue = '',
  name,
  ...args
}) => (
  <Form
    onSubmit={noop}
    initialValues={{ [name]: initialValue }}
    render={() => <CheckboxArray {...args} name={name} />}
  />
)

export const EmptyInitialValue = Template.bind({})
EmptyInitialValue.args = {
  initialValue: ''
}

export const EmptyArrayValue = Template.bind({})
EmptyArrayValue.args = {
  initialValue: []
}

export const NonEmptyArrayValue = Template.bind({})
NonEmptyArrayValue.args = {
  initialValue: ['a']
}

export const ShowAllCheckbox = Template.bind({})
ShowAllCheckbox.args = {
  showAllCheckbox: true
}
