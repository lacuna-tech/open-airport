import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Form } from 'react-final-form'
import noop from 'lodash/noop'

import TimePicker, { TimePickerProps } from './TimePicker'

const meta: Meta<TimePickerProps> = {
  title: 'TimePicker',
  component: TimePicker,
  args: {
    name: 'time',
    label: 'Time'
  }
}
export default meta

const Template: Story<TimePickerProps & { initialValue?: string | number | Date | null }> = ({
  initialValue,
  name,
  ...props
}) => (
  <Form
    onSubmit={noop}
    initialValues={{ [name]: initialValue }}
    render={() => <TimePicker {...props} name={name} style={{ width: 400 }} />}
  />
)

export const NullInitialValue = Template.bind({})
NullInitialValue.args = {
  initialValue: null
}

export const WithInitialValueString = Template.bind({})
WithInitialValueString.args = {
  initialValue: '12:10:00'
}

export const WithInitialTimestamp = Template.bind({})
WithInitialTimestamp.args = {
  initialValue: Date.now()
}

export const WithInitialDate = Template.bind({})
WithInitialDate.args = {
  initialValue: new Date()
}
