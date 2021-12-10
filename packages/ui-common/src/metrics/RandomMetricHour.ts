/**
 * Generate an entire random day metric, eby creating 24 hourly Slices,
 * then aggregating into an additional `daily` metric.
 * Any `props` passed in (e.g. `provider_id`) will apply to all generated rows.
 * Accepts array of vehicle types to generate data rows for, otherwise generates all
 */
/* eslint-disable no-param-reassign */
import cloneDeep from 'lodash/cloneDeep'
import { DateTime } from 'luxon'

import { getVehicleTypes } from '../store/serverConfig/serverConfig'
// eslint-disable-next-line import/no-cycle
import { MetricSlice, PartialMetricSlice, MetricSet, RandomMetricSlice } from '.'
import { getProviderSampleForHour } from './providerAverageWeek'

export function RandomMetricHour(
  {
    start_time = DateTime.now().minus({ hour: 1 }).startOf('hour').valueOf(),
    provider_id,
    ...startProps
  }: PartialMetricSlice = {},
  vehicleTypes = getVehicleTypes()!
): MetricSet {
  const props = cloneDeep({ start_time, provider_id, ...startProps })

  const slices: MetricSlice[] = vehicleTypes.map(vehicle_type => ({
    ...props,
    ...RandomMetricSlice(props),
    vehicle_type,
    bin_size: 'hour',
    ...(provider_id ? getProviderSampleForHour(start_time, provider_id) : {})
  }))

  return new MetricSet(slices)
}
