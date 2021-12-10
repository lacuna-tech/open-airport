import React from 'react'
import { Meta, Story } from '@storybook/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/pro-solid-svg-icons'
import { Duration } from 'luxon'

import { DateRange } from '../../DateRangeInput'

import { LiveDateRangeFilterCard, LiveDateRangeFilterCardProps } from '.'

const meta: Meta<LiveDateRangeFilterCardProps> = {
  title: 'Filters/LiveDateRangeFilterCard',
  component: LiveDateRangeFilterCard,
  decorators: [
    StoryComp => (
      <div style={{ maxWidth: 300 }}>
        <StoryComp />
      </div>
    )
  ]
}
export default meta

const Template: Story<LiveDateRangeFilterCardProps> = ({ onChange, ...props }: LiveDateRangeFilterCardProps) => {
  const [value, setValue] = React.useState<DateRange | null>(null)
  const updateValue = React.useCallback(
    (newValue: DateRange | null) => {
      onChange?.(newValue)
      setValue(newValue)
    },
    [onChange]
  )
  return <LiveDateRangeFilterCard {...props} value={value} onChange={updateValue} />
}

export const Default = Template.bind({})

export const WithIcon = Template.bind({})
WithIcon.args = {
  icon: <FontAwesomeIcon icon={faClock} />
}

export const WithLive = Template.bind({})
WithLive.args = {
  withLive: true,
  liveIntervalSize: Duration.fromObject({ minutes: 15 }),
  liveUpdateFrequency: 5_000
}

export const WithTime = Template.bind({})
WithTime.args = {
  withTime: true
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true
}
