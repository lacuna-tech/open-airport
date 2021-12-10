/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Form } from 'react-final-form'
import noop from 'lodash/noop'

import ChipSelect, { ChipSelectProps } from './ChipSelect'

// options: { value: string; label: string }[] // `[{ value, label }]` used to generate options and chips.
// name: string // passed to <Field>
// allowNull?: boolean // passed to <Field>
// multiple?: boolean // passed to <TextField inputProps/>:

const meta: Meta<ChipSelectProps> = {
  title: 'ChipSelect',
  component: ChipSelect,
  args: {
    options: [
      { value: 'a', label: 'AAAAAA' },
      { value: 'b', label: 'BBBBBB' },
      { value: 'c', label: 'CCCC' },
      { value: 'd', label: 'D' }
    ],
    name: 'list',
    label: 'A-B-C'
  }
}
export default meta

const Template: Story<ChipSelectProps & { initialValue?: string | string[] }> = ({
  initialValue = '',
  name,
  ...args
}) => (
  <Form
    onSubmit={noop}
    initialValues={{ [name]: initialValue }}
    render={() => <ChipSelect {...args} name={name} style={{ width: 200 }} />}
  />
)

export const SingleEmptyInitialValue = Template.bind({})
SingleEmptyInitialValue.args = {
  initialValue: ''
}

export const SingleWithInitialValue = Template.bind({})
SingleWithInitialValue.args = {
  initialValue: 'a'
}

export const MultipleEmptyInitialValue = Template.bind({})
MultipleEmptyInitialValue.args = {
  multiple: true,
  initialValue: ''
}

export const MultipleEmptyArrayInitialValue = Template.bind({})
MultipleEmptyArrayInitialValue.args = {
  multiple: true,
  initialValue: []
}

export const MultipleNonEmptyArrayInitialValue = Template.bind({})
MultipleNonEmptyArrayInitialValue.args = {
  multiple: true,
  initialValue: ['a']
}
