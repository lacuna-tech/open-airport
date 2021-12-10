import React from 'react'
import { Meta, Story } from '@storybook/react'
import { DateTime } from 'luxon'

import MetricsTable, { MetricsTableProps } from './MetricsTable'
import { RandomMetricDay } from '../../metrics/RandomMetricDay'
import { LoadState } from '../../util/store_utils'
import { getMetric } from '../../metrics/utils'

const meta: Meta<MetricsTableProps> = {
  title: 'MetricsTable',
  component: MetricsTable,
  args: {
    columns: [
      { metric: getMetric('time_range') },
      { metric: getMetric('trip_count') },
      { metric: getMetric('total_fees') },
      { metric: getMetric('avg_wait_time') },
      { metric: getMetric('avg_dwell_time') },
      { metric: getMetric('shared_trip_percent') }
    ],
    loadState: LoadState.loaded
  }
}
export default meta

const dayStart = DateTime.now().startOf('day').valueOf()
const daySet = RandomMetricDay({ provider_id: '1', start_time: dayStart }, ['car'])

const Template: Story<MetricsTableProps> = args => <MetricsTable {...args} />

export const NoRows = Template.bind({})
NoRows.args = {
  rows: []
}

export const OneDay = Template.bind({})
OneDay.args = {
  rows: daySet.forBinSize(dayStart, 'day')
}

export const TwentyFourHours = Template.bind({})
TwentyFourHours.args = {
  rows: daySet.forBinSize(dayStart, 'hour')
}
