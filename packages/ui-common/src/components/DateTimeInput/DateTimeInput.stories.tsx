import React from 'react'
import { Meta, Story } from '@storybook/react'
import { DateTime } from 'luxon'

import { DateTimeInput, DateTimeInputProps } from './DateTimeInput'

const meta: Meta<DateTimeInputProps> = {
  title: 'DateTimeInput',
  component: DateTimeInput,
  args: {
    id: 'test',
    label: 'Event Date'
  }
}
export default meta

const Template: Story<DateTimeInputProps> = ({ onChange, ...props }) => {
  const [value, setValue] = React.useState<DateTime | null>(null)
  return (
    <DateTimeInput
      {...props}
      value={value}
      onChange={newValue => {
        onChange?.(newValue)
        setValue(newValue)
      }}
    />
  )
}

export const Default = Template.bind({})

export const WithTime = Template.bind({})
WithTime.args = {
  withTime: true
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true
}

export const Error = Template.bind({})
Error.args = {
  error: true,
  helperText: 'got an error'
}
