import { DateTime, Interval } from 'luxon'
import { MetricInterval } from './definitions'
import { getMetricsDateParams } from './helper'

describe('metricsDateParamsForInterval', () => {
  const now = DateTime.utc()
  // 'PT15M'
  const fifteenMinDuration = Interval.fromDateTimes(now.minus({ minute: 15 }), now)
  const oneHourDuration = Interval.fromDateTimes(now.minus({ hour: 1 }), now)
  const fourHourDuration = Interval.fromDateTimes(now.minus({ hour: 4 }), now)

  // 'PT1H'
  const thirteenHourDuration = Interval.fromDateTimes(now.minus({ hour: 13 }), now)
  const twoDayDuration = Interval.fromDateTimes(now.minus({ day: 2 }), now)
  const sixDayTwentyThreeHoursDuration = Interval.fromDateTimes(now.minus({ day: 6, hour: 23 }), now)

  // 'P1D'
  const sevenDayDuration = Interval.fromDateTimes(now.minus({ day: 7 }), now)
  const tenDayduration = Interval.fromDateTimes(now.minus({ day: 10 }), now)
  const cases: [Interval, MetricInterval][] = [
    [fifteenMinDuration, 'PT15M'],
    [oneHourDuration, 'PT15M'],
    [fourHourDuration, 'PT15M'],
    [thirteenHourDuration, 'PT1H'],
    [twoDayDuration, 'PT1H'],
    [sixDayTwentyThreeHoursDuration, 'PT1H'],
    [sevenDayDuration, 'P1D'],
    [tenDayduration, 'P1D']
  ]
  it.each(cases)('returns correct params for given duration', (duration, expectedInterval) => {
    const { start_date, end_date, interval } = getMetricsDateParams(duration)
    expect(interval).toBe(expectedInterval)

    // As is
    if (expectedInterval === 'PT15M') {
      expect(start_date).toBe(duration.start.toMillis())
      expect(end_date).toBe(duration.end.toMillis())
    }

    // Rounded to hour
    if (expectedInterval === 'PT1H') {
      expect(start_date).toBe(duration.start.startOf('hour').toMillis())
      expect(end_date).toBe(duration.end.endOf('hour').toMillis())
    }

    // Rounded to day
    if (expectedInterval === 'P1D') {
      expect(start_date).toBe(duration.start.startOf('day').toMillis())
      expect(end_date).toBe(duration.end.endOf('day').toMillis())
    }
  })
})
