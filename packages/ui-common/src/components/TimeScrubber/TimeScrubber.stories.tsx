import React from 'react'
import { actions } from '@storybook/addon-actions'

import { DateTime, Duration } from 'luxon'
import { withBase } from '../../storybook/decorators'

import { TimeScrubber } from '.'
import { TimeScrubberProps } from './TimeScrubber'

export default {
  title: 'TimeScrubber',
  component: TimeScrubber,
  decorators: [withBase]
}

const defaultArgs: TimeScrubberProps = {
  min: DateTime.fromISO('2021-01-04T07:00:00.000Z'),
  max: DateTime.fromISO('2021-01-04T18:00:00.000Z'),
  step: Duration.fromObject({ minutes: 15 })
}

const { onChange } = actions('onChange')

export const Default = (args: typeof defaultArgs) => <TimeScrubber {...args} onChange={onChange} />
Default.args = {
  ...defaultArgs
}
