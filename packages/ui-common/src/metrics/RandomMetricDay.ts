/**
 * Generate an entire random day metric, eby creating 24 hourly Slices,
 * then aggregating into an additional `daily` metric.
 * Any `props` passed in (e.g. `provider_id`) will apply to all generated rows.
 * Accepts array of vehicle types to generate data rows for, otherwise generates all
 */
/* eslint-disable no-param-reassign */
import { DateTime } from 'luxon'

import { makeRange } from '../util'
import { getVehicleTypes } from '../store/serverConfig/serverConfig'
// eslint-disable-next-line import/no-cycle
import { PartialMetricSlice, MetricSet, RandomMetricHour } from '.'

export function RandomMetricDay(startProps: PartialMetricSlice = {}, vehicleTypes = getVehicleTypes()!): MetricSet {
  const { start_time } = startProps
  const dayStart = (start_time != null ? DateTime.fromMillis(start_time) : DateTime.now()).startOf('day')

  const hourlyMetricSets = makeRange(24).reduce<MetricSet[]>(
    (slices, i) => [
      ...slices,
      RandomMetricHour({ ...startProps, start_time: dayStart.plus({ hours: i }).valueOf() }, vehicleTypes)
    ],
    []
  )

  const hours = MetricSet.join(...hourlyMetricSets)
  const days = hours.aggregateTimeBin('hour', 'day')
  return MetricSet.join(days, hours)
}
