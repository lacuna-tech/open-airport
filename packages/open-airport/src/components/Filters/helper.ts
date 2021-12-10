import { TripDomainModel } from '@lacuna-core/mds-trip-backend'
import {
  AirportEventMeasureNames,
  AirportVehicleStateMeasureNames,
  defined,
  getMetricsDateParams,
  GetVehicleEventsFilterParams,
  intervalFromPreset,
  isTimeRangePreset,
  MetricFilter,
  MetricInterval,
  MetricName,
  TimeRangePreset
} from '@lacuna/ui-common'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { Timestamp } from '@mds-core/mds-types'
import { isStringArray } from '@mds-core/mds-utils'
import { DateTime, Interval } from 'luxon'
import { GetVehicleEventsOrderOption } from '@mds-core/mds-ingest-service'
import { eventTypeMetricMap, vehicleStateMetricMap } from 'lib'
import { FilterState, SELECTABLE_FILTERS } from './types'

const MIN_DEFAULT_START_DATE = DateTime.now().minus({ year: 1 })

const arrayFilterExcludes = (filterValue: unknown, field: string) => {
  return filterValue && isStringArray(filterValue) && filterValue.length > 0 && !filterValue.includes(field)
}

const arrayFilterIncludesAny = (filterValue: unknown, fields: string[]) => {
  return filterValue && isStringArray(filterValue) && fields.some(field => filterValue.includes(field))
}

const isInRange = (filterValue: unknown, timestamp: number) => {
  const { start, end } = filterValue as { start: MaterialUiPickersDate; end: MaterialUiPickersDate }
  const instant = DateTime.fromMillis(timestamp)
  if (start != null && end != null) {
    return Interval.fromDateTimes(start, end).contains(instant)
  }
  return false
}

// Client side data filtering
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterEvents = (filters: FilterState, events: any[]) => {
  return events.filter(event => {
    return (Object.keys(filters) as SELECTABLE_FILTERS[]).every(filterKey => {
      const filterValue = filters[filterKey]

      let meetsCriteria = true
      switch (filterKey) {
        case 'time_range':
          if (filterValue && !isInRange(filterValue, event.recorded)) {
            meetsCriteria = false
            break
          }
          break
        case 'geography_id':
          if (
            filterValue &&
            event.geography_id &&
            (filterValue as string[]).length > 0 &&
            !arrayFilterIncludesAny(filterValue, event.geography_id)
          ) {
            meetsCriteria = false
            break
          }
          break
        case 'provider_id':
          if (filterValue && arrayFilterExcludes(filterValue, event.provider_id)) {
            meetsCriteria = false
            break
          }
          break
        case 'vehicle_event':
          if (
            filterValue &&
            (filterValue as string[]).length > 0 &&
            !arrayFilterIncludesAny(filterValue, event.event_types)
          ) {
            meetsCriteria = false
            break
          }
          break
        case 'vehicle_id':
          if (
            filterValue &&
            typeof filterValue === 'string' &&
            event.vehicle_id &&
            !event.vehicle_id.toLowerCase().includes(filterValue.toLowerCase())
          ) {
            meetsCriteria = false
            break
          }
          break
        case 'vehicle_state':
          if (filterValue && arrayFilterExcludes(filterValue, event.vehicle_state)) {
            meetsCriteria = false
            break
          }
          break
        default:
          break
      }
      return meetsCriteria
    })
  })
}

export const filterTrips = (filters: FilterState, trips: TripDomainModel[]) => {
  return trips.filter(trip => {
    return Object.keys(filters).every(filterKey => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filterValue = (filters as { [key: string]: any })[filterKey]
      let meetsCriteria = true
      switch (filterKey) {
        case 'recorded':
          if (
            filterValue &&
            !isInRange(filterValue, trip.min_event_timestamp) &&
            !isInRange(filterValue, trip.max_event_timestamp)
          ) {
            meetsCriteria = false
            break
          }
          break
        case 'provider_id':
          if (filterValue && arrayFilterExcludes(filterValue, trip.provider_id)) {
            meetsCriteria = false
            break
          }
          break
        case 'transaction_types':
          if (filterValue && arrayFilterExcludes(filterValue, trip.transaction_type)) {
            meetsCriteria = false
            break
          }
          break
        case 'service_types':
          if (filterValue && arrayFilterExcludes(filterValue, trip.service_type)) {
            meetsCriteria = false
            break
          }
          break
        case 'vehicle_id':
          if (
            filterValue &&
            typeof filterValue === 'string' &&
            !trip.vehicle_id.toLowerCase().includes(filterValue.toLowerCase())
          ) {
            meetsCriteria = false
            break
          }
          break
        default:
          break
      }
      return meetsCriteria
    })
  })
}

export const getTimeRangeOrDefault = (timeRange: Interval | TimeRangePreset | undefined) => {
  if (timeRange) {
    const { start, end } = isTimeRangePreset(timeRange) ? intervalFromPreset(timeRange) : timeRange
    return { start: start.toMillis(), end: end.toMillis() }
  }
  return {
    start: MIN_DEFAULT_START_DATE.valueOf(),
    end: DateTime.now().valueOf()
  }
}

export const filterStateToFilterParams = (
  { time_range, vehicle_id, provider_id, vehicle_event, geography_id, vehicle_state }: FilterState,
  order?: GetVehicleEventsOrderOption,
  limit?: number
): GetVehicleEventsFilterParams => {
  const timeRangeFromInterval = getTimeRangeOrDefault(time_range)

  return {
    grouping_type: 'all_events',
    limit: limit ?? 10_000,
    time_range: timeRangeFromInterval,
    vehicle_id,
    provider_ids: provider_id,
    event_types:
      vehicle_event?.length === 0 ? undefined : (vehicle_event as GetVehicleEventsFilterParams['event_types']),
    geography_ids: geography_id,
    vehicle_states: vehicle_state,
    order
  }
}

type MeasureMap = {
  eventMeasures: Partial<AirportEventMeasureNames>[]
  stateMeasures: Partial<AirportVehicleStateMeasureNames>[]
  otherMeasures: Partial<MetricName>[]
}

/*
  Remove "airport.event" and "airport.state" measures based on FilterState param
*/
const filterMeasures = ({ measures, filterState }: { measures: Partial<MetricName>[]; filterState: FilterState }) => {
  const { vehicle_event, vehicle_state } = filterState

  // Parse out event measures and state measures from "other" measures to filter properly
  const measureMap: MeasureMap = measures.reduce<MeasureMap>(
    (map, measure) => {
      const newMap = { ...map }
      if (measure.includes('airport.event')) {
        newMap.eventMeasures = [...map.eventMeasures, measure as AirportEventMeasureNames]
      } else if (measure.includes('airport.state')) {
        newMap.stateMeasures = [...map.stateMeasures, measure as AirportVehicleStateMeasureNames]
      } else {
        newMap.otherMeasures = [...map.otherMeasures, measure as MetricName]
      }

      return newMap
    },
    { eventMeasures: [], stateMeasures: [], otherMeasures: [] }
  )

  if (vehicle_event && vehicle_event.length > 0) {
    measureMap.eventMeasures = measureMap.eventMeasures.filter(measure =>
      vehicle_event.includes(eventTypeMetricMap[measure as AirportEventMeasureNames])
    )
  }

  if (vehicle_state && vehicle_state.length > 0) {
    measureMap.stateMeasures = measureMap.stateMeasures.filter(measure =>
      vehicle_state.includes(vehicleStateMetricMap[measure as AirportVehicleStateMeasureNames])
    )
  }
  return [...measureMap.eventMeasures, ...measureMap.stateMeasures, ...measureMap.otherMeasures]
}

export const getTimeRangeAndInterval = (timeRange: Interval | TimeRangePreset | undefined) => {
  if (timeRange === undefined) {
    return getMetricsDateParams(TimeRangePreset.PAST_HOUR)
  }
  return getMetricsDateParams(timeRange)
}

/*
  Transforms FilterState into properties to be applied to metrics API request.

  If provided with measures, apply filters to measures where applicable 
    and return filtered array of measures to be applied to query.
  I.e event_type and vehicle_state filters.
*/
export const builderMetricQueryFilters: (options: {
  filterState: FilterState
  measures?: Partial<MetricName>[]
}) => {
  filters: MetricFilter[]
  start_date: Timestamp
  end_date: Timestamp
  interval: MetricInterval
  filteredMeasures?: Partial<MetricName>[]
} = ({ filterState, measures }) => {
  const { time_range, geography_id, provider_id } = filterState
  const { start_date, end_date, interval } = getTimeRangeAndInterval(time_range)

  const filteredMeasures = measures ? filterMeasures({ measures, filterState }) : undefined

  return {
    start_date,
    end_date,
    interval,
    filters: defined([
      geography_id && geography_id.length > 0
        ? {
            name: 'geography_id',
            values: geography_id
          }
        : undefined,
      provider_id && provider_id.length > 0
        ? {
            name: 'provider_id',
            values: provider_id
          }
        : undefined
    ]),
    filteredMeasures
  }
}
