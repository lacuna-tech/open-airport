import { METRICS_TRANSACTION_TYPE } from '@lacuna-core/mds-metrics-service'
import {
  makeRange,
  MetricAggregate,
  MetricInterval,
  MetricName,
  AirportEventMeasureNames,
  MetricValues,
  LiteralKeys,
  AirportVehicleStateMeasureNames
} from '@lacuna/ui-common'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { TNC_VEHICLE_EVENT, TNC_VEHICLE_STATE, UUID } from '@mds-core/mds-types'
import { FilterState } from 'components'
import { DateTime } from 'luxon'

const timeBinStarts = (
  timeInterval: MetricInterval,
  timeFilters?: { start: MaterialUiPickersDate; end: MaterialUiPickersDate }
): DateTime[] => {
  if (timeInterval === 'PT1H') {
    if (timeFilters) {
      const startTime = timeFilters.start?.startOf('hour').startOf('minute').startOf('second').startOf('millisecond')
      const range = 24
      return makeRange(range).map(i => {
        return (startTime ?? DateTime.now()).plus({ hours: i })
      })
    }
    const startTime = DateTime.now()
      .minus({ day: 1 })
      .startOf('hour')
      .startOf('minute')
      .startOf('second')
      .startOf('millisecond')
    const range = 24
    return makeRange(range).map(i => {
      return startTime.plus({ hours: i })
    })
  }
  if (timeInterval === 'P1D') {
    if (timeFilters) {
      const startDate = timeFilters.start?.startOf('day').startOf('hour').startOf('minute').startOf('millisecond')
      const endDate = timeFilters.end
      const duration = startDate != null && endDate !== null ? Math.abs(startDate.diff(endDate).as('days')) : 0
      const range = makeRange(duration || startDate?.daysInMonth || 31).map(i => {
        return (startDate ?? DateTime.now()).plus({ days: i })
      })
      return range
    }
    const today = DateTime.now().startOf('day').startOf('hour').startOf('minute').startOf('millisecond')
    const startDay = today.minus({ days: 30 })
    return makeRange(31).map(i => {
      return startDay.plus({ day: i })
    })
  }
  return []
}

const getMeasureCounts = (interval: MetricInterval): { trips: number; events: number } => {
  const hourlyTrips = [20, 80]
  const dailyTrips = [1500, 3000]
  const [tripsMin, tripsMax] = interval === 'P1D' ? dailyTrips : hourlyTrips
  const trips = Math.round(Math.random() * (tripsMax - tripsMin) + tripsMin)

  const hourlyEvents = [15, 40]
  const dailyEvents = [700, 1400]
  const [eventsMin, eventsMax] = interval === 'P1D' ? dailyEvents : hourlyEvents
  const events = Math.round(Math.random() * (eventsMax - eventsMin) + eventsMin)
  return {
    trips,
    events
  }
}

const seedAggregate = (
  timebin: DateTime,
  transaction_type: METRICS_TRANSACTION_TYPE,
  provider_id: UUID,
  geography_id: string,
  eventFilters: TNC_VEHICLE_EVENT[],
  interval: MetricInterval
): MetricAggregate => {
  const measures = LiteralKeys<AirportEventMeasureNames>(eventTypeMetricMap).filter(name =>
    eventFilters && eventFilters.length > 0 ? eventFilters.includes(eventTypeMetricMap[name]) : true
  ) as Partial<MetricName>[]
  const feeMultipler = interval === 'P1D' ? 300 : 50
  const { trips } = getMeasureCounts(interval)
  const eventMeasures = measures.reduce((acc, measure) => {
    const { events } = getMeasureCounts(interval)
    // Skew enter/leave higher than other types
    const numEvents =
      measure === 'airport.event.enter_jurisdiction.count' || measure === 'airport.event.leave_jurisdiction.count'
        ? events * 1.5
        : events
    return { ...acc, [measure]: Math.round(numEvents) }
  }, {}) as MetricValues

  return {
    time_bin_start: timebin.toSeconds(),
    time_bin_start_formatted: timebin.toISO(),
    time_bin_duration: 'PT1H',
    dimensions: { transaction_type, provider_id, geography_id },
    measures: {
      ...eventMeasures,
      'airport.trips.count':
        transaction_type === 'pick_up' ? Math.round(trips - trips * (Math.random() * (0.4 - 0.15) + 0.15)) : trips,
      'airport.fees.count': Math.round(Math.floor(Math.random() * feeMultipler)),
      'airport.passenger_wait.avg': Math.round(Math.floor(Math.random() * 10 * 1000)),
      'airport.dwell.avg': Math.round(Math.floor(Math.random() * 10 * 1000))
    },
    aggregates: []
  } as MetricAggregate
}
const provider_ids = [
  'c20e08cf-8488-46a6-a66c-5d8fb827f7e0',
  'e714f168-ce56-4b41-81b7-0b6a4bd26128',
  'ea772b38-5180-46d9-8795-eb326a7140a5'
]
const geofence_ids = ['assignment', 'lax', 'terminal']
const transaction_types = ['pick_up', 'drop_off']

export const generateFakeMetricsAggregate = (
  interval: MetricInterval,
  filters?: Partial<FilterState>
): MetricAggregate[] => {
  const timeFilters = filters
    ? (filters.time_range as { start: MaterialUiPickersDate; end: MaterialUiPickersDate })
    : undefined
  const providerIdFilters = filters && (filters.provider_id as UUID[])
  const geofenceIdFilters = filters && (filters.geography_id as string[])
  const eventFilters: TNC_VEHICLE_EVENT[] = filters ? (filters.vehicle_event as TNC_VEHICLE_EVENT[]) : []
  const aggregate: MetricAggregate[] = timeBinStarts(interval, timeFilters)
    .map(timebin =>
      provider_ids
        .map(provider_id =>
          geofence_ids
            .map(geofence_id =>
              transaction_types.map(transaction_type =>
                seedAggregate(
                  timebin,
                  transaction_type as METRICS_TRANSACTION_TYPE,
                  provider_id,
                  geofence_id,
                  eventFilters,
                  interval
                )
              )
            )
            .flat()
        )
        .flat()
    )
    .flat()
  const filteredAgg = aggregate.filter(agg => {
    let meetsCriteria = true
    if (providerIdFilters && providerIdFilters.length > 0) {
      if (!providerIdFilters.includes(agg.dimensions.provider_id!)) {
        meetsCriteria = false
      }
    }
    if (geofenceIdFilters && geofenceIdFilters.length > 0) {
      if (!geofenceIdFilters.includes(agg.dimensions.geography_id!)) {
        meetsCriteria = false
      }
    }
    return meetsCriteria
  })
  return filteredAgg
}

export const eventTypeMetricMap: { [key in AirportEventMeasureNames]: TNC_VEHICLE_EVENT } = {
  'airport.event.comms_lost.count': 'comms_lost',
  'airport.event.comms_restored.count': 'comms_restored',
  'airport.event.driver_cancellation.count': 'driver_cancellation',
  'airport.event.enter_jurisdiction.count': 'enter_jurisdiction',
  'airport.event.leave_jurisdiction.count': 'leave_jurisdiction',
  'airport.event.passenger_cancellation.count': 'passenger_cancellation',
  'airport.event.provider_cancellation.count': 'provider_cancellation',
  'airport.event.reservation_start.count': 'reservation_start',
  'airport.event.reservation_stop.count': 'reservation_stop',
  'airport.event.service_end.count': 'service_end',
  'airport.event.service_start.count': 'service_start',
  'airport.event.trip_end.count': 'trip_end',
  'airport.event.trip_resume.count': 'trip_resume',
  'airport.event.trip_start.count': 'trip_start',
  'airport.event.trip_stop.count': 'trip_stop',
  'airport.event.unspecified.count': 'unspecified'
}

export const vehicleStateMetricMap: { [key in AirportVehicleStateMeasureNames]: TNC_VEHICLE_STATE } = {
  'airport.state.available.count': 'available',
  'airport.state.elsewhere.count': 'elsewhere',
  'airport.state.non_operational.count': 'non_operational',
  'airport.state.on_trip.count': 'on_trip',
  'airport.state.reserved.count': 'reserved',
  'airport.state.stopped.count': 'stopped',
  'airport.state.unknown.count': 'unknown'
}
