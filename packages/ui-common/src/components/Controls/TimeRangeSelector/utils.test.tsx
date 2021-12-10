import { DateTime, Interval } from 'luxon'
import { TimeRangePreset } from './types'
import { intervalFromPreset, isTimeRangePreset, timeRangePresetLabel } from './utils'

describe('timeRangePresetMap', () => {
  const cases: [TimeRangePreset, number][] = [
    [TimeRangePreset.PAST_HOUR, 1],
    [TimeRangePreset.PAST_4_HOURS, 4],
    [TimeRangePreset.PAST_12_HOURS, 12],
    [TimeRangePreset.PAST_24_HOURS, 24],
    [TimeRangePreset.PAST_48_HOURS, 48],
    [TimeRangePreset.PAST_WEEK, 1]
  ]
  it.each(cases)('returns correct interval and label for %p preset', (preset, val) => {
    const now = DateTime.utc()
    const minusOptions = preset === TimeRangePreset.PAST_WEEK ? { week: val } : { hour: val }
    const expectedInterval = Interval.fromDateTimes(now.minus(minusOptions), now)
    const interval = intervalFromPreset(preset)
    const label = timeRangePresetLabel(preset)

    expect(interval.start.toFormat('MM/DD/YYYY HH:MM')).toEqual(expectedInterval.start.toFormat('MM/DD/YYYY HH:MM'))
    expect(label).toEqual(preset)
  })
})

describe('isTimeRangePreset', () => {
  it('returns false if input is invalid', () => {
    const result = isTimeRangePreset('absodjasod')
    expect(result).toBe(false)
  })
  it('returns true if input is valid', () => {
    const result = isTimeRangePreset('Past Hour')
    expect(result).toBe(true)
  })
  it('returns true if input is from TimeRangePreset', () => {
    const result = isTimeRangePreset(TimeRangePreset.PAST_24_HOURS)
    expect(result).toBe(true)
  })
})
