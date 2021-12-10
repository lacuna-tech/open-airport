import { sum } from 'lodash'
import { DurationUnit } from 'luxon'
import { formatCurrency, formatDuration, formatNumber, formatPercent, MetricValueFormatterType } from './formatting'

export interface MetricDefinition {
  name: MetricName
  title: string
  aggregate: (values: number[]) => number
  format: MetricValueFormatterType
}

export type MetricInterval = 'PT0S' | 'PT15M' | 'PT1H' | 'P1D'

export const metricIntervalMap: {
  [key in MetricInterval]: {
    quantity: number
    unit: DurationUnit
    durationUnit: DurationUnit
  }
} = {
  PT0S: { quantity: 0, unit: 'millisecond', durationUnit: 'millisecond' },
  PT15M: { quantity: 15, unit: 'minute', durationUnit: 'minute' },
  PT1H: { quantity: 1, unit: 'hour', durationUnit: 'hour' },
  P1D: { quantity: 1, unit: 'day', durationUnit: 'day' }
}

export const AirportEventMeasureNames = [
  'airport.event.comms_lost.count',
  'airport.event.comms_restored.count',
  'airport.event.driver_cancellation.count',
  'airport.event.enter_jurisdiction.count',
  'airport.event.leave_jurisdiction.count',
  // 'airport.event.maintenance.count',
  'airport.event.passenger_cancellation.count',
  'airport.event.driver_cancellation.count',
  'airport.event.provider_cancellation.count',
  'airport.event.reservation_start.count',
  'airport.event.reservation_stop.count',
  'airport.event.service_end.count',
  'airport.event.service_start.count',
  'airport.event.trip_end.count',
  'airport.event.trip_resume.count',
  'airport.event.trip_start.count',
  'airport.event.trip_stop.count',
  'airport.event.unspecified.count'
] as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AirportEventMeasureNames = typeof AirportEventMeasureNames[number]

export const AirportVehicleStateMeasureNames = [
  'airport.state.available.count',
  'airport.state.elsewhere.count',
  'airport.state.non_operational.count',
  'airport.state.on_trip.count',
  'airport.state.reserved.count',
  'airport.state.stopped.count',
  'airport.state.unknown.count'
] as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AirportVehicleStateMeasureNames = typeof AirportVehicleStateMeasureNames[number]

export const MetricNames = [
  // Airport Vehicle Event Metrics - Q2 21
  ...AirportEventMeasureNames,

  ...AirportVehicleStateMeasureNames,

  // Historic
  'airport.trips.count',
  'airport.fees.count',
  'airport.passenger_connect_time.avg',
  'airport.passenger_wait.avg',
  'airport.dwell.avg',
  'airport.utilization.avg', // q1
  'airport.upgrades.count', // q1

  // Snapshot
  'airport.utilization',
  'airport.occupancy',
  'airport.upgrades', // q1
  // Predicted
  'airport.predicted.trips.pt15m.count',
  'airport.predicted.utilization.pt15m',
  'airport.predicted.occupancy.pt15m',
  'airport.predicted.upgrades.pt15m.count', // q1
  'airport.predicted.trips.pt30m.count',
  'airport.predicted.utilization.pt30m',
  'airport.predicted.occupancy.pt30m',
  'airport.predicted.upgrades.pt30m.count', // q1

  // Compliance
  'compliance.aggregate.avg',
  // 'compliance.aggregate.count',
  // 'compliance.aggregate.max',
  // 'compliance.aggregate.min',
  // 'compliance.aggregate.sum'

  'trips.count',
  'events.trip_end.count',
  'events.trip_start.count',
  'events.trip_leave_jurisdiction.count'
] as const

export type MetricName = typeof MetricNames[number]

export const MetricDefinitionMap: { [key in MetricName]: MetricDefinition } = {
  // Historic
  'airport.trips.count': {
    name: 'airport.trips.count',
    title: 'Trips',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.fees.count': {
    name: 'airport.fees.count',
    title: 'Fees',
    aggregate: values => sum(values),
    format: formatCurrency
  },
  'airport.passenger_connect_time.avg': {
    name: 'airport.passenger_connect_time.avg',
    title: 'Average Passenger Connect Time',
    aggregate: values => sum(values) / values.length || 0,
    format: formatDuration
  },
  'airport.passenger_wait.avg': {
    name: 'airport.passenger_wait.avg',
    title: 'Average Passenger Wait Time',
    aggregate: values => sum(values) / values.length || 0,
    format: formatDuration
  },
  'airport.dwell.avg': {
    name: 'airport.dwell.avg',
    title: 'Average Dwell Time',
    aggregate: values => sum(values) / values.length || 0,
    format: formatDuration
  },
  'airport.utilization.avg': {
    name: 'airport.utilization.avg',
    title: 'Average Utilization',
    aggregate: values => sum(values) / values.length || 0,
    format: formatPercent
  },
  'airport.upgrades.count': {
    name: 'airport.upgrades.count',
    title: 'Curb Upgrades',
    aggregate: values => sum(values),
    format: formatNumber
  },

  // Vehicle Event Metrics
  'airport.event.comms_lost.count': {
    name: 'airport.event.comms_lost.count',
    title: 'Comms Lost',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.comms_restored.count': {
    name: 'airport.event.comms_restored.count',
    title: 'Comms Restored',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.driver_cancellation.count': {
    name: 'airport.event.driver_cancellation.count',
    title: 'Driver Cancellation',
    aggregate: values => sum(values),
    format: formatNumber
  },
  // 'airport.event.maintenance.count': {
  //   name: 'airport.event.maintenance.count',
  //   title: 'Maintenance',
  //   aggregate: values => sum(values),
  //   format: formatNumber
  // },
  'airport.event.passenger_cancellation.count': {
    name: 'airport.event.passenger_cancellation.count',
    title: 'Passenger Cancellation',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.provider_cancellation.count': {
    name: 'airport.event.provider_cancellation.count',
    title: 'Proivder Cancellation',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.reservation_start.count': {
    name: 'airport.event.reservation_start.count',
    title: 'Reservation Start',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.reservation_stop.count': {
    name: 'airport.event.reservation_stop.count',
    title: 'Reservation Stop',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.service_end.count': {
    name: 'airport.event.service_end.count',
    title: 'Service End',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.service_start.count': {
    name: 'airport.event.service_start.count',
    title: 'Service Start',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.trip_end.count': {
    name: 'airport.event.trip_end.count',
    title: 'Trip End',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.trip_resume.count': {
    name: 'airport.event.trip_resume.count',
    title: 'Trip Resume',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.trip_start.count': {
    name: 'airport.event.trip_start.count',
    title: 'Trip Start',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.trip_stop.count': {
    name: 'airport.event.trip_stop.count',
    title: 'Trip Stop',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.unspecified.count': {
    name: 'airport.event.unspecified.count',
    title: 'Unspecified',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.enter_jurisdiction.count': {
    name: 'airport.event.enter_jurisdiction.count',
    title: 'Enter Events',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.event.leave_jurisdiction.count': {
    name: 'airport.event.leave_jurisdiction.count',
    title: 'Exit Events',
    aggregate: values => sum(values),
    format: formatNumber
  },

  // Airport Vehicle State Metrics
  'airport.state.available.count': {
    name: 'airport.state.available.count',
    title: 'Available',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.elsewhere.count': {
    name: 'airport.state.elsewhere.count',
    title: 'Elsewhere',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.non_operational.count': {
    name: 'airport.state.non_operational.count',
    title: 'Non-Operational',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.on_trip.count': {
    name: 'airport.state.on_trip.count',
    title: 'On Trip',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.reserved.count': {
    name: 'airport.state.reserved.count',
    title: 'Reserved',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.stopped.count': {
    name: 'airport.state.stopped.count',
    title: 'Stopped',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.state.unknown.count': {
    name: 'airport.state.unknown.count',
    title: 'Unknown',
    aggregate: values => sum(values),
    format: formatNumber
  },

  // Snapshot
  'airport.utilization': {
    name: 'airport.utilization',
    title: 'Utilization',
    aggregate: values => sum(values) / values.length || 0,
    format: formatPercent
  },
  'airport.occupancy': {
    name: 'airport.occupancy',
    title: 'Occupancy',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.upgrades': {
    name: 'airport.upgrades',
    title: 'Curb Upgrades',
    aggregate: values => sum(values),
    format: formatNumber
  },
  // Predicted 15
  'airport.predicted.trips.pt15m.count': {
    name: 'airport.predicted.trips.pt15m.count',
    title: 'Predicted Trips (15m)',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.predicted.upgrades.pt15m.count': {
    name: 'airport.predicted.upgrades.pt15m.count',
    title: 'Predicted Upgrades (15m)',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.predicted.utilization.pt15m': {
    name: 'airport.predicted.utilization.pt15m',
    title: 'Predicted Utilization (15m)',
    aggregate: values => sum(values) / values.length || 0,
    format: formatPercent
  },
  'airport.predicted.occupancy.pt15m': {
    name: 'airport.predicted.occupancy.pt15m',
    title: 'Predicted Occupancy (15m)',
    aggregate: values => sum(values),
    format: formatNumber
  },
  // Predicted 30m
  'airport.predicted.trips.pt30m.count': {
    name: 'airport.predicted.trips.pt30m.count',
    title: 'Predicted Trips (30m)',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.predicted.upgrades.pt30m.count': {
    name: 'airport.predicted.upgrades.pt30m.count',
    title: 'Predicted Upgrades (30m)',
    aggregate: values => sum(values),
    format: formatNumber
  },
  'airport.predicted.utilization.pt30m': {
    name: 'airport.predicted.utilization.pt30m',
    title: 'Predicted Utilization (30m)',
    aggregate: values => sum(values) / values.length || 0,
    format: formatPercent
  },
  'airport.predicted.occupancy.pt30m': {
    name: 'airport.predicted.occupancy.pt30m',
    title: 'Predicted Occupancy (30m)',
    aggregate: values => sum(values),
    format: formatNumber
  },

  // Compliance

  'compliance.aggregate.avg': {
    name: 'compliance.aggregate.avg',
    title: 'Average Compliance',
    aggregate: values => sum(values) / values.length || 0,
    format: formatNumber
  },

  'trips.count': {
    name: 'trips.count',
    title: 'Trip counts',
    aggregate: values => sum(values),
    format: formatNumber
  },

  'events.trip_start.count': {
    name: 'events.trip_start.count',
    title: 'Trip Start Counts',
    aggregate: values => sum(values),
    format: formatNumber
  },

  'events.trip_end.count': {
    name: 'events.trip_end.count',
    title: 'Trip End Counts',
    aggregate: values => sum(values),
    format: formatNumber
  },

  'events.trip_leave_jurisdiction.count': {
    name: 'events.trip_leave_jurisdiction.count',
    title: 'Trip Leave Jurisdiction Counts',
    aggregate: values => sum(values),
    format: formatNumber
  }
}

export const MetricDefinitions: MetricDefinition[] = Object.values(MetricDefinitionMap)
