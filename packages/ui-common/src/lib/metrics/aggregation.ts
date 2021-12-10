import type { MetricDimension } from '@lacuna-core/mds-metrics-service'
import { ValidationError } from '@mds-core/mds-utils'
import { unique } from '../../util/enumerable'
import { LiteralKeys, LiteralPartialEntries } from '../../util/dictionary'
import { MetricDefinitionMap, MetricName } from './definitions'
import { MetricAggregate, MetricValues } from './types'
import { buildDefaultMeasures, extractDimmensionsInCommon, isNotEmpty } from './helper'

export interface MetricAggrigationValidationError {
  error: string
}

export type MetricAggregationPool = Partial<{ [key in MetricName]: number[] }>

export const getMetricNames: (options: { aggregate: MetricAggregate }) => MetricName[] = ({
  aggregate: { measures: metrics }
}) => LiteralKeys<MetricName>(metrics)

export const getDimensionValues: (options: {
  dimension: MetricDimension
  aggregates: MetricAggregate[]
}) => (string | null | undefined)[] = ({ dimension, aggregates }) =>
  aggregates.map(({ dimensions }) => dimensions[dimension])

/* Returns a new aggregate that is the aggregation of a set of aggregates.
Dimensions will be only the dimensions in common.
Metric values will be aggregated by their defined aggregation expression.
Start time will be the soonest start time in the set.
All the source aggregates will be stored in a aggregates prop for future rollup/down. */
export const aggregateMetrics: (options: { aggregates: MetricAggregate[] }) => MetricAggregate = ({ aggregates }) => {
  if (aggregates === undefined || aggregates.length === 0)
    throw new Error('Cannot aggregate an empty set of aggregates.')
  const time_bin_durations = unique(aggregates.map(({ time_bin_duration }) => time_bin_duration))
  if (time_bin_durations.length > 1)
    throw new ValidationError('Aggregation across multiple time bins is not currently supported', time_bin_durations)

  const [earliestAggregate] = sortMetrics(aggregates, aggregate => aggregate.time_bin_start)
  const metricNames = getMetricNames({ aggregate: earliestAggregate })

  // Group the aggregate's measure values by metric name
  // E.g., { "airport.utilization": [0.14, 0.45], "airport.occupancy": [69, 78] }
  const aggregationPool = aggregates
    .filter(isNotEmpty)
    .map(({ measures }) => {
      return measures
    })
    .reduce<MetricAggregationPool>(
      (tier1GroupingPool, metrics) =>
        metricNames.reduce<MetricAggregationPool>(
          (tier2GroupingPool, name) => ({
            ...tier2GroupingPool,
            [name]: [...(tier2GroupingPool[name] || []), metrics[name]]
          }),
          tier1GroupingPool
        ),
      {}
    )
  // Then build a new aggregate with the aggregation of it's metric values
  const aggregate: MetricAggregate = {
    ...earliestAggregate,
    dimensions: extractDimmensionsInCommon({ aggregates }),
    measures: {
      ...buildDefaultMeasures(metricNames),
      ...LiteralPartialEntries(aggregationPool).reduce<MetricValues>((aggregated, [key, values]) => {
        return {
          ...aggregated,
          [key]: MetricDefinitionMap[key].aggregate(
            // TODO: I'm not sure how great an idea it is to filter out 0s. I get it, the synthetic aggregates
            // are created with 0s and can potentially skew the results. There are problems in either case.
            // When filtering like this, empty arrays to go into aggregation functions for which assumed 0.
            values.filter(value => value)
          )
        }
      }, {})
    },
    aggregates
  }

  return aggregate
}

/* Given a set of metrics and a dimension, group aggregates by the dimension. 
E.g., when grouping by geography_id and these aggregates:
  [ { ..., dimension: { provider_id: 1, geography_id: 'a' } }, { ..., dimension: { provider_id: 1, geography_id: 'b' } },
    { ..., dimension: { provider_id: 2, geography_id: 'a' } }, { ..., dimension: { provider_id: 2, geography_id: 'b' } } ]
returns: { 'a': [{ dimension: { provider_id: 1, geography_id: 'a' } }, { dimension: { provider_id: 2, geography_id: 'a' } }],
           'b': [{ dimension: { provider_id: 1, geography_id: 'b' } }, { dimension: { provider_id: 2, geography_id: 'b' } }] }
*/
export const groupMetricsByDimension: (options: {
  aggregates: MetricAggregate[]
  dimension: MetricDimension
}) => { [value: string]: MetricAggregate[] } = ({ aggregates, dimension }) =>
  aggregates.reduce<{ [value: string]: MetricAggregate[] }>((grouping, aggregate) => {
    const { dimensions } = aggregate
    const dimensionValue = dimensions[dimension]
    return dimensionValue
      ? { ...grouping, [dimensionValue]: [...(grouping[dimensionValue] || []), aggregate] }
      : grouping
  }, {})

/* Given a set of measures and a key selector, group and aggregate measures. 
E.g., with key selector aggregate => aggregate.dimension.geography_id, and these aggregates:
  [ { ..., dimension: { provider_id: 1, geography_id: 'a' } }, { ..., dimension: { provider_id: 1, geography_id: 'b' } },
    { ..., dimension: { provider_id: 2, geography_id: 'a' } }, { ..., dimension: { provider_id: 2, geography_id: 'b' } } ]
returns: [ { ..., dimension: { geography_id: 'a' }, measures: { ...aggregates values... }, aggregates: [ aggregate1, aggregate3 ] },
           { ..., dimension: { geography_id: 'b' }, measures: { ...aggregates values... }, aggregates: [ aggregate2, aggregate4 ] } ]
*/
export const groupAndAggregateMetrics: (
  aggregates: MetricAggregate[],
  keySelector: (aggregate: MetricAggregate) => string | number | (string | number | undefined | null)[]
) => MetricAggregate[] = (aggregates, keySelector) => {
  const metricGroups = aggregates.reduce<{ [value: string]: MetricAggregate[] }>((grouping, aggregate) => {
    const rawKey = keySelector(aggregate)
    const key = Array.isArray(rawKey) ? rawKey.join('_') : rawKey
    return { ...grouping, [key]: [...(grouping[key] || []), aggregate] }
  }, {})
  return Object.values(metricGroups).map(aggregatesGroup => aggregateMetrics({ aggregates: aggregatesGroup }))
}

/* Sort metrics by selector of number type. */
export const sortMetrics: (
  aggregates: MetricAggregate[],
  selector: (aggregate: MetricAggregate) => number
) => MetricAggregate[] = (aggregates, selector) => aggregates.slice().sort((a, b) => selector(a) - selector(b))

/* Filter metrics by predicate of boolean type. */
export const filterMetrics: (
  aggregates: MetricAggregate[],
  predicate: (aggregate: MetricAggregate) => boolean
) => MetricAggregate[] = (aggregates, predicate) => {
  return aggregates.filter(aggregate => predicate(aggregate))
}

/* Combine multiple collections of metrics together into a single collection.
Note: No aggregation or anything happening other than merge together arrays of metrics.  */
export const combineMetrics: (aggregateCollections: MetricAggregate[][]) => MetricAggregate[] = aggregateCollections =>
  aggregateCollections.reduce<MetricAggregate[]>((accumulated, aggregates) => [...accumulated, ...aggregates], [])

/* Given a set of aggregates (typicaly the source aggregates props of an aggregated aggregate) and a filter predicate,
will return a new aggregate that has been aggregated by the filtered results. */
export const filterAndAggregateMetrics: (
  aggregates: MetricAggregate[],
  predicate: (aggregate: MetricAggregate) => boolean
) => MetricAggregate | undefined = (aggregates, predicate) => {
  const filteredAggregates = filterMetrics(aggregates, predicate)
  return filteredAggregates.length > 0 ? aggregateMetrics({ aggregates: filteredAggregates }) : undefined
}
