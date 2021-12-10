/* eslint-disable import/no-cycle */
/**
 * Generate a semi-realistic metrics bin.
 * Anything you pass in props will be applied and should feed into the "realistic" nature.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import merge from 'lodash/merge'
import { DateTime } from 'luxon'

import { MetricSlice, PartialMetricSlice, IntegerMap } from './types'
// eslint-disable-next-line import/no-cycle
import { jitter, between } from './utils'

export function RandomMetricSlice(props: PartialMetricSlice = {}) {
  const event_counts: any = cloneDeep(props.event_counts || {})
  const vehicle_counts: any = cloneDeep(props.vehicle_counts || {})
  const sla: any = cloneDeep(props.sla || {})
  const vehicle_trips_counts = cloneDeep(((props.vehicle_trips_counts || {}) as unknown) as IntegerMap)

  // figure out vehicle activity and derive the rest from that
  const max_vehicle_cap = sla.max_vehicle_cap || between(1, 20) * 100
  const registered = jitter(vehicle_counts.registered, between(max_vehicle_cap * 0.5, max_vehicle_cap * 1.5))
  const deployed = jitter(vehicle_counts.deployed, between(registered / 2, registered))

  const idle = jitter(vehicle_trips_counts[0], between(deployed * 0.6, deployed * 0.8))
  vehicle_trips_counts[0] = idle
  let count = deployed - idle
  for (let i = 1; i < 10; i++) {
    const vehicles = between(0, count)
    if (vehicles > 0) {
      vehicle_trips_counts[i] = vehicles
      count -= vehicles
    }
    if (count === 0) break
  }

  const trip_count = jitter(props.trip_count, between(0.1, 0.5, { multiplier: deployed }))

  const trip_start = event_counts.trip_start || between(trip_count * 0.8, trip_count)
  const trip_enter = event_counts.trip_enter || trip_count - trip_start
  const trip_end = event_counts.trip_end || between(trip_start * 0.8, trip_start)
  const trip_leave = event_counts.trip_leave || trip_count - trip_end
  const telemetry = event_counts.telemetry || between(trip_count * 50, trip_count * 500)

  const start_end_violations = get(props, 'event_time_violations.start_end.count', 0)
  const start_end_violation_count = (trip_start + trip_end) * (start_end_violations / 100)

  const enter_leave_violations = get(props, 'event_time_violations.enter_leave.count', start_end_violations)
  const enter_leave_violation_count = (trip_enter + trip_leave) * (enter_leave_violations / 100)

  const telemetry_violations = get(props, 'event_time_violations.telemetry.count', start_end_violations)
  const telemetry_violation_count = telemetry * (telemetry_violations / 100)

  const overrideProps: PartialMetricSlice = {
    sla: { max_vehicle_cap },
    trip_count,
    vehicle_counts: { registered, deployed },
    event_counts: { trip_start, trip_end, trip_enter, trip_leave, telemetry },
    event_time_violations: {
      start_end: { count: start_end_violation_count },
      enter_leave: { count: enter_leave_violation_count },
      telemetry: { count: telemetry_violation_count }
    }
  }

  const randomBin: MetricSlice = {
    start_time: DateTime.now().startOf('hour').valueOf(),
    vehicle_type: between(0, 10) < 8 ? 'scooter' : 'bicycle',
    provider_id: 'ea772b38-5180-46d9-8795-eb326a7140a5',
    geography: null,
    stop_id: null,
    spot_id: null,
    bin_size: 'hour',

    vehicle_counts: {
      registered,
      deployed,
      dead: between(0, 5)
    },

    trip_count,
    vehicle_trips_counts,

    event_counts: {
      trip_start,
      trip_end,
      trip_enter,
      trip_leave,
      telemetry,
      service_start: 0,
      user_drop_off: 0,
      provider_drop_off: 0,
      cancel_reservation: 0,
      reserve: 0,
      service_end: 0,
      register: 0,
      provider_pick_up: 0,
      agency_drop_off: 0,
      default: 0,
      deregister: 0,
      agency_pick_up: 0
    },

    event_time_violations: {
      start_end: {
        count: start_end_violation_count,
        min: between(5, 10),
        max: between(11, 40),
        average: between(5, 40)
      },
      enter_leave: {
        count: enter_leave_violation_count,
        min: between(5, 10),
        max: between(11, 40),
        average: between(5, 40)
      },
      telemetry: {
        count: telemetry_violation_count,
        min: between(5, 1000),
        max: between(1000, 2000),
        average: between(1000, 2000)
      }
    },

    telemetry_distance_violations: {
      count: between(0, telemetry),
      min: 0,
      max: 0,
      average: 0
    },

    bad_events: {
      invalid_count: 0,
      duplicate_count: 0,
      out_of_order_count: 0
    },

    sla: {
      max_vehicle_cap,
      min_registered: 100,
      min_trip_start_count: 100,
      min_trip_end_count: 100,
      min_telemetry_count: 1000,
      max_start_end_time: 30,
      max_enter_leave_time: 30,
      max_telemetry_time: 1680,
      max_telemetry_distance: 100,
      max_avg_dwell_time: 105000
    },

    shared_trip_count: between(20, 100),
    total_fees: between(200, 1000),
    avg_wait_time: between(4 * 60 * 1000, 6 * 60 * 1000), // 4-6 minutes
    avg_dwell_time: between(0.5 * 60 * 100, 3 * 60 * 1000), // .5-3 minutes
    utilized_vehicle_percent: between(0.1, 0.9, { round: false }),
    curb_upgrades: between(trip_count * 0.1, trip_count * 0.9)
  }
  // Merge values passed in as props, with props "winning"
  return merge(randomBin, cloneDeep(props), overrideProps) as MetricSlice
}
