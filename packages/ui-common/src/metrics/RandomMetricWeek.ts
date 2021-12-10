/**
 * Generate an entire week's work of RandomMetricDays
 * Any `props` passed in (e.g. `provider_id`) will apply to all generated rows.
 */
import cloneDeep from 'lodash/cloneDeep'
import times from 'lodash/times'
import { DateTime } from 'luxon'

// eslint-disable-next-line import/no-cycle
import { PartialMetricSlice, MetricSet, RandomMetricDay } from '.'

export function RandomMetricWeek(props: PartialMetricSlice = {}) {
  // console.time('Create random metric week')
  const weekStart = (props.start_time != null ? DateTime.fromMillis(props.start_time) : DateTime.now())
    .startOf('day')
    .minus({ days: 7 })

  let week = new MetricSet()
  times(7, dayNumber => {
    const start_time = weekStart.plus({ days: dayNumber }).valueOf()
    week = week.concat(RandomMetricDay({ ...cloneDeep(props), start_time }))
  })
  // console.timeEnd('Create random metric week')
  return week
}
