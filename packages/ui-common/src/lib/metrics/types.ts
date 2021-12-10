import type { MetricDimension, MetricDomainModel } from '@lacuna-core/mds-metrics-service'
import { DateTime } from 'luxon'
import { Timestamp } from '@mds-core/mds-types'
import type { MetricsApiQuerySpecification } from '@lacuna-core/mds-metrics-api'
import { EnumerableProps } from '../../util/types'
import { GeographyType } from '../geography'
import { MetricName, MetricInterval, metricIntervalMap, MetricDefinitionMap } from './definitions'
import { roundDown } from '../../util'
import { TimeRangePreset } from '../../components/Controls/TimeRangeSelector'

/* Seem unable to import MetricFilter from mds-metric-api as it's inaccessible. This is a close aproximation.  */
export type MetricFilter = {
  name: MetricDimension
  values: EnumerableProps<DimensionValues>[MetricDimension]
}

/* Dimension constraints are collections of sets of dimensions that express valid combinations.
This is essential for exposing and trimming invalid combinations of dimensions during
defragmentation or when generating metrics. 
E.g., Given [ [ { vehicle_type: 'car' } ], [ { geography_id: 'a', geography_type: 'stop' }, { geography_id: 'b', geography_type: 'spot' } ]]
We can then know EVERY OTHER combinations is invalid, such as { vehicle_type: 'car', geography_id: 'a', geography_type: 'spot' } 
or { vehicle_type: 'bike', geography_id: 'a', geography_type: 'stop' } */
export type DimensionConstraints = DimensionValues[][]

/* Tightening up some of the typings of API defined MetricsApiQuerySpecification */
export type MetricsApiQuery = Omit<
  MetricsApiQuerySpecification,
  'start_date' | 'end_date' | 'measures' | 'dimensions' | 'interval' | 'filters'
> & {
  start_date?: Timestamp
  end_date?: Timestamp
  measures: MetricName[]
  dimensions: MetricDimension[]
  interval: MetricInterval
  filters: MetricFilter[]
}

export type MetricValues = Partial<
  {
    [key in MetricName]: number
  }
>

export type DimensionValues = Partial<
  Omit<Pick<MetricDomainModel, MetricDimension>, 'geography_type'> & {
    geography_type: GeographyType
    event_type: 'enter_jurisdiction' | 'leave_jurisdiction'
  }
>

export type MetricAggregate = {
  time_bin_start: number
  time_bin_start_formatted?: string
  time_bin_duration: MetricInterval
  dimensions: DimensionValues
  measures: MetricValues
  aggregates: MetricAggregate[]
}

export const formatTime = ({ time_bin_start }: { time_bin_start: Timestamp; interval: MetricInterval }) =>
  `${DateTime.fromMillis(time_bin_start).toFormat('LL/dd')}, ${DateTime.fromMillis(time_bin_start, {
    zone: 'utc'
  }).toFormat('ha')}-${DateTime.fromMillis(time_bin_start).plus({ hour: 1 }).toFormat('ha')}`

export const addInterval = ({ timestamp, interval }: { timestamp: Timestamp; interval: MetricInterval }) => {
  const { quantity, durationUnit } = metricIntervalMap[interval]
  return DateTime.fromMillis(timestamp)
    .plus({ [durationUnit]: quantity })
    .valueOf()
}

export const getMetricValue = ({ name, aggregate: { measures } }: { name: MetricName; aggregate: MetricAggregate }) => {
  return measures[name]
}

export const getFormattedMetricValue = ({ name, aggregate }: { name: MetricName; aggregate: MetricAggregate }) => {
  return MetricDefinitionMap[name].format(getMetricValue({ name, aggregate }) || 0)
}

type MetricsTimeRangeMap = {
  [key in TimeRangePreset]: () => { start_date: Timestamp; end_date: Timestamp; interval: MetricInterval }
}

export const metricsTimeRangeMap: MetricsTimeRangeMap = {
  [TimeRangePreset.PAST_4_HOURS]: () => {
    const end_date = roundDown({ dateTime: DateTime.now(), quantity: 15, unit: 'minute' })
    return {
      start_date: end_date.minus({ hours: 4 }).toMillis(),
      end_date: end_date.toMillis(),
      interval: 'PT15M'
    }
  },
  [TimeRangePreset.PAST_12_HOURS]: () => {
    const end_date = roundDown({ dateTime: DateTime.now(), quantity: 15, unit: 'minute' })
    return {
      start_date: end_date.minus({ hours: 12 }).toMillis(),
      end_date: end_date.toMillis(),
      interval: 'PT15M'
    }
  },
  [TimeRangePreset.PAST_24_HOURS]: () => ({
    start_date: DateTime.now().startOf('hour').minus({ hours: 24 }).toMillis(),
    end_date: DateTime.now().startOf('hour').toMillis(),
    interval: 'PT1H'
  }),
  [TimeRangePreset.PAST_48_HOURS]: () => ({
    start_date: DateTime.now().startOf('hour').minus({ hours: 48 }).toMillis(),
    end_date: DateTime.now().startOf('hour').toMillis(),
    interval: 'PT1H'
  }),

  [TimeRangePreset.PAST_HOUR]: () => {
    const end = roundDown({ dateTime: DateTime.now(), quantity: 15, unit: 'minute' })
    return {
      start_date: end.minus({ hours: 1 }).toMillis(),
      end_date: end.toMillis(),
      interval: 'PT15M'
    }
  },
  [TimeRangePreset.PAST_WEEK]: () => {
    return {
      start_date: DateTime.now().startOf('day').minus({ days: 7 }).toMillis(),
      end_date: DateTime.now().endOf('day').toMillis(),
      interval: 'P1D'
    }
  }
}
