import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Duration } from 'luxon'

import { TimeRangeSelector, TimeRangeSelectorProps } from './TimeRangeSelector'

const meta: Meta<TimeRangeSelectorProps> = {
  title: 'Controls/TimeRangeSelector',
  component: TimeRangeSelector,
  args: {
    id: '#timeRange'
  }
}
export default meta

const Template: Story<TimeRangeSelectorProps> = args => <TimeRangeSelector {...args} />

export const Default = Template.bind({})
Default.args = {}

export const MaxDuration = Template.bind({})
MaxDuration.args = {
  maxDuration: Duration.fromObject({ days: 7 })
}
