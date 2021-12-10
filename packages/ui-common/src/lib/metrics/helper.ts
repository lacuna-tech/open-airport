import type { Timestamp } from '@mds-core/mds-types'
import type { MetricDimension } from '@lacuna-core/mds-metrics-service'
import { DateTime, Interval } from 'luxon'

import { EnumerableProps, isSubset, LiteralKeys, unionObjectsEnumerables, unique, uniqueBy } from '../../util'
import { MetricInterval, MetricName } from './definitions'
import {
  addInterval,
  DimensionConstraints,
  DimensionValues,
  formatTime,
  MetricAggregate,
  MetricFilter,
  MetricsApiQuery,
  metricsTimeRangeMap,
  MetricValues
} from './types'
import { isTimeRangePreset, TimeRangePreset } from '../../components/Controls/TimeRangeSelector'

/* Build a range of timestamps between start and end by interval. */
export function* makeTimestamps({
  start_date,
  end_date,
  interval
}: {
  start_date: Timestamp
  end_date: Timestamp
  interval: MetricInterval
}): Generator<number, void, unknown> {
  if (interval === 'PT0S') {
    yield DateTime.now().valueOf()
  } else {
    let timestampCursor = start_date
    while (timestampCursor < end_date) {
      yield timestampCursor
      timestampCursor = addInterval({ timestamp: timestampCursor, interval })
    }
  }
}

/* Given a collection of aggregates, extract out the dimension values.
E.g., given 
  [ { dimension: { provider_id: 1, geography_id: 'a' } }, { dimension: { provider_id: 1, geography_id: 'b' } },
    { dimension: { provider_id: 2, geography_id: 'a' } }, { dimension: { provider_id: 2, geography_id: 'b' } } ]
returns: { provider_id: [1, 2], geography_id: ['a', 'b'] }  */
export const extractDimensionValuesFromAggregates: (options: {
  aggregates: MetricAggregate[]
}) => EnumerableProps<DimensionValues> = ({ aggregates }) => {
  // Tally together all the dimension values keyed by dimension.
  // E.g., { provider_id: [1, 1, 2, 2], geography_id: ['a', 'a', 'b', 'b'] }
  const talliedDimensionValues = aggregates.reduce<EnumerableProps<DimensionValues>>(
    (accumulation, { dimensions }) =>
      LiteralKeys<MetricDimension>(dimensions).reduce<EnumerableProps<DimensionValues>>(
        (accumulation2, dimension) => ({
          ...accumulation2,
          [dimension]: [...(accumulation2[dimension] || []), dimensions[dimension]]
        }),
        accumulation
      ),
    {}
  )

  // Then make distinct the tallied values
  // E.g., { provider_id: [1, 2], geography_id: ['a', 'b'] }
  return LiteralKeys<MetricDimension>(talliedDimensionValues).reduce<EnumerableProps<DimensionValues>>(
    (accumulation, dimension) => ({ ...accumulation, [dimension]: unique(talliedDimensionValues[dimension]!) }),
    {}
  )
}

/* Given a metric query, extract out the dimension values of the filter.
E.g., { filters: [ { name: 'geography_id', values: ['a', 'b', 'c'] } ] } 
returns: { geography_id: ['a', 'b', 'c'] }
*/
export const extractDimensionValuesFromMetricFilters: (options: {
  filters: MetricFilter[]
}) => EnumerableProps<DimensionValues> = ({ filters }) =>
  filters
    ? filters.reduce<EnumerableProps<DimensionValues>>(
        (accumulated, { name, values }) => ({ ...accumulated, [name]: values }),
        {}
      )
    : {}

/* Given a subset of dimensions with values: { dimensions: { provider_id: [1, 2], geography_id: ['a', 'b'] } }
return the equivalent filters: [ { name: 'provider_id', values: [1,2] }, { name: 'geography_id', values: ['a', 'b'] } ]
*/
export const convertDimensionValuesToMetricFilters: (options: {
  dimensions: EnumerableProps<DimensionValues>
}) => MetricFilter[] = ({ dimensions }) =>
  LiteralKeys<MetricDimension>(dimensions).map(name => ({ name, values: dimensions[name] }))

/* Given a subset of dimensions with values: { dimensions: { provider_id: [1, 2], geography_id: ['a', 'b'] } }
  return all the combinations of dimensions:
  [ { provider_id: 1, geography_id: 'a' }, { provider_id: 1, geography_id: 'b' },
    { provider_id: 2, geography_id: 'a' }, { provider_id: 2, geography_id: 'b' } ] */
export const buildDimensionCombinations: (options: {
  dimensions: EnumerableProps<DimensionValues>
  constraints?: DimensionConstraints
}) => DimensionValues[] = ({ dimensions, constraints }) => {
  // build a collection of property fragment collections, each array keyed with a single dimension and varied by seed values
  // E.g., [ [{provider_id: 1}, {provider_id: 2}], [{geography_id: 'a'}, {geography_id: 'b'}], [ etc ] ]
  const fragmentCollections = LiteralKeys<MetricDimension>(dimensions).reduce<DimensionValues[][]>((results, key) => {
    return [...results, (dimensions[key] || []).map(dimensionValue => ({ [key]: dimensionValue }))]
  }, [])

  // Then reduce down the collection of collections to the dimension combinations
  const dimensionCombinations: DimensionValues[] = fragmentCollections.reduce<DimensionValues[]>(
    (combinations, fragmentCollection) =>
      combinations.length > 0
        ? combinations.reduce<DimensionValues[]>((combinationDivisions, combination) => {
            return [...combinationDivisions, ...fragmentCollection.map(fragment => ({ ...combination, ...fragment }))]
          }, [])
        : fragmentCollection,
    []
  )

  return constraints
    ? // Triming down the dimension combinations based on supplied valid combinations constraint.
      dimensionCombinations.filter(dimensionCombination =>
        constraints.every(combinations =>
          combinations.some(validDimensionCombination => isSubset(dimensionCombination, validDimensionCombination))
        )
      )
    : dimensionCombinations
}

/* Given some metric names, build a default measures for those names.  */
export const buildDefaultMeasures = (metricNames: MetricName[]) =>
  metricNames.reduce<MetricValues>((accumulation, metric) => ({ ...accumulation, [metric]: 0 }), {})

/* Given a collection of aggregates, find the dimensions they have in common.
E.g., [ { dimensions: { provider_id: 1, vehicle_type: 'car', geography_id: 'a' } },
        { dimensions: { provider_id: 2, vehicle_type: 'car', geography_id: 'a' } } ]
returns: { vehicle_type: 'car', geography_id: 'a' } */
export const extractDimmensionsInCommon: (options: { aggregates: MetricAggregate[] }) => DimensionValues = ({
  aggregates
}): DimensionValues => {
  // Extract a dimension values superset from aggregates. ({ provider_id: [1, 2], geography_id: ['a'], etc })
  const dimensionValues = extractDimensionValuesFromAggregates({ aggregates })

  // Then enumerate the superset entries filtering down the values by what every aggregate has.
  return LiteralKeys<MetricDimension>(dimensionValues).reduce((accumulation, dimension) => {
    const filteredDimensionValues = dimensionValues[dimension]?.filter(dimensionValue =>
      aggregates.every(aggregate => aggregate.dimensions[dimension] === dimensionValue)
    )
    const valueInCommon = filteredDimensionValues ? [filteredDimensionValues] : undefined
    return valueInCommon ? { ...accumulation, [dimension]: valueInCommon } : accumulation
  }, {})
}

/* Given a MetricApiQuery, generate a single default aggregate for each unit of time between start and end by interval. */
export const generateEmptyAggregatesOverTime = ({
  query: { interval, start_date, end_date, measures }
}: {
  query: MetricsApiQuery
}): MetricAggregate[] => {
  const defaultMeasures = buildDefaultMeasures(measures)
  return [
    ...(start_date && end_date
      ? makeTimestamps({
          start_date,
          end_date,
          interval
        })
      : [DateTime.now().toMillis()])
  ].reduce<MetricAggregate[]>(
    (results, time_bin_start) => [
      ...results,
      {
        time_bin_start,
        time_bin_start_formatted: formatTime({ time_bin_start, interval }),
        time_bin_duration: interval,
        dimensions: {},
        measures: defaultMeasures,
        aggregates: []
      }
    ],
    []
  )
}

/* Given a collection of empty aggregates, one per unit of time, create a copy of
each aggregate with each dimension combination.  */
export const splitEmptyMetricByDimensions: (options: {
  emptyAggregates: MetricAggregate[]
  dimensionCombinations: DimensionValues[]
}) => MetricAggregate[] = ({ emptyAggregates, dimensionCombinations }) => {
  return emptyAggregates.reduce<MetricAggregate[]>(
    (aggregates, aggregate) => [
      ...aggregates,
      ...dimensionCombinations.map(combination => ({ ...aggregate, dimensions: combination }))
    ],
    []
  )
}

/* Build a unique key for a metric based on key values that is used for evaluating metric equality. */
export const buildMetricKey: (aggregate: MetricAggregate) => string = ({
  dimensions,
  time_bin_start,
  time_bin_duration
}) =>
  `${time_bin_duration === 'PT0S' ? '' : `_${time_bin_start}`}${time_bin_duration}_${Object.values(dimensions).join(
    '_'
  )}`

/* Indicates whether an aggregate is empty by checking if it has any actual values. */
export const isNotEmpty = (aggregate: MetricAggregate): boolean => {
  const measureValues = Object.values(aggregate.measures)
  return measureValues.length > 0 && !measureValues.every(value => value === 0)
}

/**
 * Given a metrics fiters array, compose a dimension values object.
 * E.g,
 * Input = { filters: [ { name: 'transaction_type': values: ['pick_up'] }, { name: 'provider_id': values: ['123', '456'] } ] }
 * Output = { 'transaction_type': ['pick_up'], 'provider_id': ['123', '456'] }
 * */
export const buildDimensionValuesFromFilters: (options: {
  filters: MetricFilter[]
}) => EnumerableProps<DimensionValues> = ({ filters }) =>
  filters.reduce<EnumerableProps<DimensionValues>>(
    (accumulation, filter) => ({ ...accumulation, [filter.name]: filter.values }),
    {}
  )

/* In order to satisfy the requirement of having empty rows of data where no data exists,
a complete set of data is needed. A complete set of data will include a metric aggregate
per dimension and per block of time (respective to the interval). To do this we need to
syntheticly create an empty aggregate for every dimension and block of time and then return
the union favoring the original set. */
export const defragmentMetrics: (options: {
  query: MetricsApiQuery
  aggregates: MetricAggregate[]
  constraints?: DimensionConstraints
  dimensionValues: EnumerableProps<DimensionValues>
}) => MetricAggregate[] = ({
  query,
  query: { filters },
  aggregates: sourceAggregates,
  constraints,
  dimensionValues
}) => {
  const emptyAggregates = generateEmptyAggregatesOverTime({ query })

  // A dimension superset is required to build out a complete sythentic set of metrics
  // (because the response data is spotty.) There are several aspects of request and
  // response data that contain this subsets, that when combined might yield a complete superset.
  // 1. The metric query filter - The smallest implicit footprint. Not typically that useful.
  // 2. The metric response data - The largest implicit footprint, but still likely contain large
  //    gaps (where metrics don't exist because events havn't occured.)
  // 3. Provided dimensionValues prop - Explicitly providing a set of expected dimension values in the
  //    metric request. This is a blanket solution but susceptible to becoming a partial set if the input
  //    becomes outdated with what comes back in the data.
  const dimensionsSuperset = unionObjectsEnumerables<EnumerableProps<DimensionValues>>(
    extractDimensionValuesFromAggregates({ aggregates: sourceAggregates }),
    dimensionValues
    // extractDimensionValuesFromMetricFilters({ filters }) // From the metric query filter (Legacy)
  )

  const dimensionValuesFromFilters = buildDimensionValuesFromFilters({ filters })

  // Now replace any key matching super set entries with entries from the filter, as a way to enforce
  // filtering on the dimension value superset, as we don't want sythetic metrics outside the filter bounds.
  const filteredDimensionSuperSet = { ...dimensionsSuperset, ...dimensionValuesFromFilters }

  const dimensionCombinations = buildDimensionCombinations({
    dimensions: filteredDimensionSuperSet,
    constraints
  })

  const syntheticAggregates = splitEmptyMetricByDimensions({ emptyAggregates, dimensionCombinations })
  const defragmentedMetrics = uniqueBy([...syntheticAggregates, ...sourceAggregates], buildMetricKey)

  // eslint-disable-next-line no-console
  console.debug('defragmentMetrics', {
    sourceAggregates,
    emptyAggregates,
    dimensionsSuperset,
    dimensionValuesFromFilters,
    filteredDimensionSuperSet,
    dimensionCombinations,
    constraints,
    syntheticAggregates,
    defragmentedMetrics
  })

  return defragmentedMetrics
}

const metricsIntervalForTimeRange = (timeRange: TimeRangePreset) => metricsTimeRangeMap[timeRange]()

const metricsDateParamsForInterval = (
  timeRange: Interval
): { start_date: number; end_date: number; interval: MetricInterval } => {
  const duration = timeRange.toDuration(['hours', 'days'])
  if (duration.days >= 7) {
    return {
      start_date: timeRange.start.startOf('day').toMillis(),
      end_date: timeRange.end.endOf('day').toMillis(),
      interval: 'P1D'
    }
  }

  if (duration.hours > 12 || duration.days >= 1) {
    return {
      start_date: timeRange.start.startOf('hour').toMillis(),
      end_date: timeRange.end.endOf('hour').toMillis(),
      interval: 'PT1H'
    }
  }

  const { start, end } = timeRange
  return { start_date: start.toMillis(), end_date: end.toMillis(), interval: 'PT15M' }
}

export const getMetricsDateParams = (timeRange: TimeRangePreset | Interval) => {
  if (isTimeRangePreset(timeRange)) {
    return metricsIntervalForTimeRange(timeRange)
  }
  return metricsDateParamsForInterval(timeRange)
}
