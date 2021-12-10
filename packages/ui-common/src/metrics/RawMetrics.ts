/**
 * List of raw metrics -- directly derived from the database.
 * Nested columns are denormalized into dotted.paths.
 */

// eslint-disable-next-line import/no-cycle
import { Metric } from './Metric'
import * as formatters from './format'

export const RawMetrics = [
  new Metric({
    name: 'start_time',
    groups: ['micromobility', 'tnc'],
    type: 'integer',
    units: 'msec',
    rowAggregator: 'first',
    timeAggregator: 'smallest',
    typical: () => Date.now()
  }),
  new Metric({
    name: 'bin_size',
    groups: ['micromobility', 'tnc'],
    type: 'choice',
    choices: ['hour', 'day', 'month'],
    rowAggregator: 'first', // ???
    timeAggregator: 'first',
    typical: 'hour'
  }),
  new Metric({
    name: 'geography',
    groups: ['micromobility'],
    type: 'string', // UUID ?
    nullable: true,
    rowAggregator: 'first', // ???
    timeAggregator: 'first',
    typical: null
  }),
  new Metric({
    groups: ['micromobility', 'tnc'],
    name: 'provider_id',
    type: 'string',
    rowAggregator: 'first', // ???
    timeAggregator: 'first',
    typical: 'ea772b38-5180-46d9-8795-eb326a7140a5' // 'Test 1' provider
  }),
  new Metric({
    name: 'vehicle_type',
    groups: ['micromobility'],
    type: 'choice',
    choices: ['scooter', 'bicycle'],
    rowAggregator: 'none',
    timeAggregator: 'first',
    typical: 'scooter'
  }),

  new Metric({
    name: 'event_counts.trip_start',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [50, 1000]
  }),
  new Metric({
    name: 'event_counts.trip_end',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [50, 1000]
  }),
  new Metric({
    name: 'event_counts.trip_enter',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [50, 1000]
  }),
  new Metric({
    name: 'event_counts.trip_leave',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [50, 1000]
  }),
  new Metric({
    name: 'event_counts.telemetry',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [50, 10000]
  }),
  new Metric({
    name: 'event_counts.service_start',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.user_drop_off',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.provider_drop_off',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.cancel_reservation',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.reserve',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.service_end',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.register',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.provider_pick_up',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.agency_drop_off',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.default',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.deregister',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'event_counts.agency_pick_up',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 50]
  }),
  new Metric({
    name: 'vehicle_counts.registered',
    groups: ['micromobility'],
    type: 'integer',
    units: 'vehicles',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [50, 1000]
  }),
  new Metric({
    name: 'vehicle_counts.deployed',
    groups: ['micromobility'],
    type: 'integer',
    units: 'vehicles',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [50, 800]
  }),
  new Metric({
    name: 'vehicle_counts.dead',
    groups: ['micromobility'],
    type: 'integer',
    units: 'vehicles',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [0, 20]
  }),

  // NOTE: `timeAggregator` is not entirely accurate, but works for simulation purposes
  new Metric({
    name: 'trip_count',
    groups: ['micromobility', 'tnc'],
    type: 'integer',
    units: 'trips',
    rowAggregator: 'sum',
    timeAggregator: 'sum', // NOTE: imprecise because of time binning
    typical: [0, 20],
    description: 'Total unique trips within time period.',
    title: 'Total number of trips'
  }),
  new Metric({
    name: 'vehicle_trips_counts',
    groups: ['micromobility'],
    type: 'integerMap',
    units: 'trips',
    rowAggregator: 'sumIntegerMaps',
    timeAggregator: 'averageIntegerMaps',
    typical: [0, 20]
  }),

  new Metric({
    name: 'event_time_violations.start_end.count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.start_end.min',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.start_end.max',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.start_end.average',
    groups: ['micromobility'],
    type: 'float',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.enter_leave.count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.enter_leave.min',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.enter_leave.max',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.enter_leave.average',
    groups: ['micromobility'],
    type: 'float',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.telemetry.count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.telemetry.min',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.telemetry.max',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'event_time_violations.telemetry.average',
    groups: ['micromobility'],
    type: 'float',
    units: 'seconds',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),

  new Metric({
    name: 'telemetry_distance_violations.count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'telemetry_distance_violations.min',
    groups: ['micromobility'],
    type: 'integer',
    units: 'meters',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'telemetry_distance_violations.max',
    groups: ['micromobility'],
    type: 'integer',
    units: 'meters',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'telemetry_distance_violations.average',
    groups: ['micromobility'],
    type: 'float',
    units: 'meters',
    rowAggregator: 'average',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'bad_events.invalid_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'bad_events.duplicate_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [0, 20]
  }),
  new Metric({
    name: 'bad_events.out_of_order_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'sum',
    timeAggregator: 'average',
    typical: [0, 20]
  }),

  /** SLAs */
  new Metric({
    name: 'sla.max_vehicle_cap',
    groups: ['micromobility'],
    type: 'integer',
    units: 'vehicles',
    rowAggregator: 'sum',
    timeAggregator: 'first',
    typical: [1, 5, 500]
  }),
  new Metric({
    name: 'sla.min_registered',
    groups: ['micromobility'],
    type: 'integer',
    units: 'vehicles',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 100
  }),
  new Metric({
    name: 'sla.min_trip_start_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 100
  }),
  new Metric({
    name: 'sla.min_trip_end_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 100
  }),
  new Metric({
    name: 'sla.min_telemetry_count',
    groups: ['micromobility'],
    type: 'integer',
    units: 'events',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 1000
  }),
  new Metric({
    name: 'sla.max_start_end_time',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 30
  }),
  new Metric({
    name: 'sla.max_enter_leave_time',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 30
  }),
  new Metric({
    name: 'sla.max_telemetry_time',
    groups: ['micromobility'],
    type: 'integer',
    units: 'seconds',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 1680
  }),
  new Metric({
    name: 'sla.max_telemetry_distance',
    groups: ['micromobility'],
    type: 'integer',
    units: 'meters',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 100
  }),

  // TNC Only
  new Metric({
    name: 'shared_trip_count',
    groups: ['tnc'],
    description: 'Number of trips which are shared.',
    type: 'integer',
    units: 'trips',
    rowAggregator: 'sum',
    timeAggregator: 'sum' // NOTE: imprecise because of time binning
  }),
  new Metric({
    name: 'airport.trips.count',
    groups: ['tnc'],
    description: '....',
    type: 'integer',
    units: 'trips',
    rowAggregator: 'sum',
    timeAggregator: 'sum',
    title: 'Trips'
  }),
  new Metric({
    name: 'total_fees',
    description: 'Total fee amount for trips initiated within timeframe.',
    groups: ['tnc'],
    type: 'float',
    format: 'currency',
    rowAggregator: 'sum',
    timeAggregator: 'sum'
  }),
  new Metric({
    name: 'avg_wait_time',
    groups: ['tnc'],
    description: 'Time between ride reservation and customer pick up.',
    type: 'integer',
    format: value => formatters.smallTimeFormatter(value, '-'),
    units: 'msec',
    rowAggregator: 'average',
    timeAggregator: 'average',
    title: 'Average Wait Time'
  }),

  new Metric({
    name: 'avg_dwell_time',
    groups: ['tnc'],
    description: 'Average between (reserve_stop and trip_stop) or (trip_stop and trip_resume) events.',
    type: 'integer',
    format: value => formatters.smallTimeFormatter(value, '-'),
    units: 'msec',
    rowAggregator: 'average',
    timeAggregator: 'average',
    title: 'Average Dwell Time',
    sla: 'sla.avg_dwell_time',
    slaOperator: 'max'
  }),
  new Metric({
    name: 'sla.max_avg_dwell_time',
    groups: ['tnc'],
    type: 'integer',
    units: 'msec',
    rowAggregator: 'first',
    timeAggregator: 'first',
    typical: 105000
  }),
  new Metric({
    name: 'curb_upgrades',
    groups: ['tnc'],
    description: '...',
    type: 'integer',
    units: 'trips',
    rowAggregator: 'sum',
    timeAggregator: 'sum', // NOTE: imprecise because of time binning
    title: 'Curb Upgrades'
  })
]
