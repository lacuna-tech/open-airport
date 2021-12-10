import React from 'react'
import { Meta, Story } from '@storybook/react'

import { DateRangeInput, DateRangeInputProps, DateRange } from '.'

const meta: Meta<DateRangeInputProps> = {
  title: 'DateRangeInput',
  component: DateRangeInput,
  args: {
    id: 'test'
  }
}
export default meta

const Template: Story<DateRangeInputProps> = ({ onChange, ...props }: DateRangeInputProps) => {
  const [value, setValue] = React.useState<DateRange | null>(null)
  const updateValue = React.useCallback(
    (newValue: DateRange | null) => {
      onChange?.(newValue)
      setValue(newValue)
    },
    [onChange]
  )
  return <DateRangeInput {...props} value={value} onChange={updateValue} />
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
