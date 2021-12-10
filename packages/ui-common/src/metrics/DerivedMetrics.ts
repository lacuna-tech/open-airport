/**
 * User-defined metrics -- derived from RawMetrics.
 */
import { getProviderName } from '../store'

// eslint-disable-next-line import/no-cycle
import { Metric } from './Metric'

export const DerivedMetrics: Metric[] = [
  new Metric({
    name: 'provider_name',
    groups: ['micromobility', 'tnc'],
    description: 'Provider name.',
    type: 'string',
    value(slice) {
      return getProviderName(slice.provider_id)
    },
    rowAggregator: 'first',
    timeAggregator: 'first',
    title: 'Provider'
  }),
  new Metric({
    name: 'current_registered',
    groups: ['micromobility'],
    description: 'Average number of registered vehicles.',
    type: 'integer',
    value: 'vehicle_counts.registered',
    sla: 'sla.min_registered',
    slaOperator: 'min',
    units: 'vehicles',
    title: 'Registered Vehicles'
  }),
  new Metric({
    name: 'current_deployed',
    groups: ['micromobility'],
    description: 'Average number of vehicles deployed in the right of way (available, reserved, in-trip, unavailable).',
    type: 'integer',
    value: 'vehicle_counts.deployed',
    sla: 'sla.max_vehicle_cap',
    slaOperator: 'max',
    units: 'vehicles',
    title: 'Deployed Vehicles'
  }),
  new Metric({
    name: 'trip_start_count',
    groups: ['micromobility'],
    description: 'Number of trip_start events received.',
    value: 'event_counts.trip_start',
    type: 'integer',
    sla: 'sla.min_trip_start_count',
    slaOperator: 'min',
    title: 'Trip Start Events',
    units: 'events'
  }),
  new Metric({
    name: 'trip_end_count',
    groups: ['micromobility'],
    description: 'Number of trip_end events received.',
    type: 'integer',
    value: 'event_counts.trip_end',
    sla: 'sla.min_trip_end_count',
    slaOperator: 'min',
    title: 'Trip End Events',
    units: 'events'
  }),
  new Metric({
    name: 'telemetry_count',
    groups: ['micromobility'],
    description: 'Number of telemetry events received.',
    type: 'integer',
    value: 'event_counts.telemetry',
    sla: 'sla.min_telemetry_count',
    slaOperator: 'min',
    title: 'Telemetry Events',
    units: 'events'
  }),
  new Metric({
    name: 'start_end_latency_average',
    groups: ['micromobility'],
    description: 'Average latency of trip_start and trip_end events received.',
    type: 'float',
    value: 'event_time_violations.start_end.average',
    sla: 'sla.max_start_end_time',
    slaOperator: 'max',
    title: 'Average Trip Latency',
    units: 'seconds'
  }),
  new Metric({
    name: 'start_end_latency_compliance',
    groups: ['micromobility'],
    description: 'Percent of trip_start and trip_end events received out of time compliance.',
    type: 'percent',
    value: slice => {
      const violations = slice.event_time_violations.start_end.count || 0
      const totalEvents = (slice.event_counts.trip_start || 0) + (slice.event_counts.trip_end || 0)
      return totalEvents ? (violations / totalEvents) * 100 : 0
    },
    rowAggregator: 'average',
    timeAggregator: 'average',
    sla: 0,
    units: '%',
    slaOperator: 'max',
    title: 'Late Trip Events (%)'
  }),
  new Metric({
    name: 'enter_leave_latency_average',
    groups: ['micromobility'],
    description: 'Average latency of trip_enter and trip_leave events received.',
    type: 'float',
    value: 'event_time_violations.enter_leave.average',
    sla: 'sla.max_enter_leave_time',
    slaOperator: 'max',
    title: 'Average Trip Enter / Leave Event Latency',
    units: 'seconds'
  }),
  new Metric({
    name: 'enter_leave_latency_compliance',
    groups: ['micromobility'],
    description: 'Percent of trip_enter and trip_leave events received out of time compliance.',
    type: 'percent',
    value: slice => {
      const violations = slice.event_time_violations.enter_leave.count || 0
      const totalEvents = slice.event_counts.trip_enter + slice.event_counts.trip_leave || 0
      return totalEvents ? (violations / totalEvents) * 100 : 0
    },
    rowAggregator: 'average',
    timeAggregator: 'average',
    sla: 0,
    units: '%',
    slaOperator: 'max',
    title: 'Late Trip Events (%)'
  }),
  new Metric({
    name: 'telemetry_latency_average',
    groups: ['micromobility'],
    description: 'Average latency of telemetry events received.',
    type: 'float',
    value: 'event_time_violations.telemetry.average',
    sla: 'sla.max_telemetry_time',
    slaOperator: 'max',
    title: 'Average Telemetry Event Latency',
    units: 'seconds'
  }),
  new Metric({
    name: 'telemetry_latency_compliance',
    groups: ['micromobility'],
    description: 'Percent of telemetry events received that are out of time compliance (24 hours).',
    type: 'percent',
    value: slice => {
      const violations = slice.event_time_violations.telemetry.count || 0
      const totalEvents = slice.event_counts.telemetry || 0
      return totalEvents ? (violations / totalEvents) * 100 : 0
    },
    rowAggregator: 'average',
    timeAggregator: 'average',
    sla: 0,
    units: '%',
    slaOperator: 'max',
    title: 'Late Telemetry Events (%)'
  }),
  new Metric({
    name: 'telemetry_distance_average',
    groups: ['micromobility'],
    description: 'Average distance between telemetry events received.',
    type: 'float',
    value: 'telemetry_distance_violations.average',
    sla: 'sla.max_telemetry_distance',
    slaOperator: 'max',
    title: 'Average Telemetry Distance',
    units: 'meters'
  }),
  new Metric({
    name: 'telemetry_distance_compliance',
    groups: ['micromobility'],
    description: 'Percent of telemetry events received out of distance compliance.',
    type: 'percent',
    value: slice => {
      const violations = slice.telemetry_distance_violations.count || 0
      const totalEvents = slice.event_counts.telemetry || 0
      return totalEvents ? (violations / totalEvents) * 100 : 0
    },
    rowAggregator: 'average',
    timeAggregator: 'average',
    sla: 0,
    units: '%',
    slaOperator: 'max',
    title: 'Late Telemetry Events (Distance)'
  }),
  new Metric({
    name: 'provider_vehicle_cap',
    groups: ['micromobility'],
    description: 'Agency Policy for maximum number of deployed vehicles for this provider.',
    type: 'integer',
    value: 'sla.max_vehicle_cap',
    title: 'Vehicle Cap',
    units: 'vehicles'
  }),
  new Metric({
    name: 'idle_vehicle_count',
    groups: ['micromobility'],
    description: 'Average number of deployed vehicles which took 0 trips.',
    type: 'integer',
    value(slice) {
      return slice.vehicle_trips_counts[0] || 0
    },
    rowAggregator: 'average',
    timeAggregator: 'average',
    // sla: 'sla.max_vehicle_cap',
    // slaOperator: 'max',
    // slaAggregator: 'sum',
    title: 'Idle Vehicle Count',
    units: 'vehicles'
  }),
  new Metric({
    name: 'idle_vehicle_percent',
    groups: ['micromobility'],
    description: 'Percent of deployed vehicles that took 0 trips.',
    type: 'percent',
    value: slice => {
      const noTripVehicles = slice.vehicle_trips_counts[0] || 0
      const deployed = slice.vehicle_counts.deployed || 0
      return deployed ? (noTripVehicles / deployed) * 100 : 0
    },
    rowAggregator: 'sum',
    timeAggregator: 'none', // Can't aggregate slices  :-(
    title: '% Idle Vehicles'
  }),
  new Metric({
    name: 'utilized_vehicle_percent',
    groups: ['micromobility'],
    description: 'Percent of deployed vehicles which took at least one trip.',
    type: 'percent',
    value: slice => {
      const noTripVehicles = slice.vehicle_trips_counts[0] || 0
      const deployed = slice.vehicle_counts.deployed || 0
      return deployed ? ((deployed - noTripVehicles) / deployed) * 100 : 0
    },
    rowAggregator: 'sum',
    timeAggregator: 'none', // Can't aggregate slices  :-(
    title: '% Idle Vehicles',
    units: 'vehicles'
  }),
  new Metric({
    name: 'average_trips_per_vehicle',
    groups: ['micromobility'],
    description: 'Average trips per vehicle deployed in the right of way.',
    type: 'float',
    value: slice => {
      const tripCount = slice.trip_count || 0
      const deployed = slice.vehicle_counts.deployed || 0
      return deployed ? tripCount / deployed : 0
    },
    precision: 2,
    rowAggregator: 'average',
    timeAggregator: 'average', // Can't aggregate slices  :-(
    title: 'Trips per Vehicle',
    units: 'trips/vehicle'
  }),
  new Metric({
    name: 'time_range',
    groups: ['tnc'],
    description: 'Time Range',
    type: 'string',
    value: slice => slice.start_time,
    rowAggregator: 'first',
    timeAggregator: 'first',
    title: 'Time'
  }),
  new Metric({
    name: 'shared_trip_percent',
    groups: ['tnc'],
    description: '% of trips are shared',
    type: 'percent',
    value: slice => [slice.shared_trip_count, slice.trip_count] || 0,
    rowAggregator: values => {
      const sumSharedTripCount = values.reduce<number>((total, next) => total + (next as number[])[0], 0)
      const sumTripCount = values.reduce<number>((total, next) => total + (next as number[])[1], 0)
      return (sumSharedTripCount / sumTripCount) * 100
    },
    timeAggregator: 'none',
    title: '% of trips are shared',
    units: 'trips'
  })
]
