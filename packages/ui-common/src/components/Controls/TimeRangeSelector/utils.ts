import { DateTime, DurationInput, Interval } from 'luxon'

import { TimeRangePreset } from './types'

const TIME_RANGE_PRESETS = new Set(Object.values(TimeRangePreset))

export const isTimeRangePreset = (value: unknown): value is TimeRangePreset => {
  if (typeof value !== 'string') {
    return false
  }
  return TIME_RANGE_PRESETS.has(value as TimeRangePreset)
}

const intervalAgo = (duration: DurationInput): Interval => {
  const now = DateTime.utc()
  return Interval.fromDateTimes(now.minus(duration), now)
}

const timeRangePresetMap: { [key in TimeRangePreset]: { label: string; interval: () => Interval } } = {
  [TimeRangePreset.PAST_HOUR]: { label: 'Past Hour', interval: () => intervalAgo({ hour: 1 }) },
  [TimeRangePreset.PAST_4_HOURS]: { label: 'Past 4 Hours', interval: () => intervalAgo({ hours: 4 }) },
  [TimeRangePreset.PAST_12_HOURS]: { label: 'Past 12 Hours', interval: () => intervalAgo({ hours: 12 }) },
  [TimeRangePreset.PAST_24_HOURS]: { label: 'Past 24 Hours', interval: () => intervalAgo({ hours: 24 }) },
  [TimeRangePreset.PAST_48_HOURS]: { label: 'Past 48 Hours', interval: () => intervalAgo({ hours: 48 }) },
  [TimeRangePreset.PAST_WEEK]: { label: 'Past Week', interval: () => intervalAgo({ week: 1 }) }
}

export const timeRangePresetLabel = (preset: TimeRangePreset): string => timeRangePresetMap[preset].label

export const intervalFromPreset = (preset: TimeRangePreset): Interval => timeRangePresetMap[preset].interval()
