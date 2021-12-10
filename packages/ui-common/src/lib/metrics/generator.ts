import { MetricAggregate, MetricsApiQuery, MetricValues, DimensionConstraints } from './types'
import {
  buildDimensionCombinations,
  extractDimensionValuesFromMetricFilters,
  generateEmptyAggregatesOverTime,
  splitEmptyMetricByDimensions
} from './helper'
import { EnumerablePropsWithParams } from '../../util'

export type MetricsValueGenerator = EnumerablePropsWithParams<
  MetricValues,
  { query: MetricsApiQuery; aggregate: MetricAggregate }
>

export type MetricGeneratorProps = {
  query: MetricsApiQuery
  valueGenerator: MetricsValueGenerator
  constraints?: DimensionConstraints
}

export const hydrateDimensionValues: (options: {
  syntheticAggregates: MetricAggregate[]
  query: MetricsApiQuery
  valueGenerator: MetricsValueGenerator
}) => MetricAggregate[] = ({ syntheticAggregates, query, query: { measures }, valueGenerator }) =>
  syntheticAggregates.map(aggregate => ({
    ...aggregate,
    measures: (measures || []).reduce<MetricValues>(
      (values, metricName) => ({ ...values, [metricName]: valueGenerator[metricName]!({ query, aggregate }) }),
      {}
    )
  }))

export const generateAggregates: (options: MetricGeneratorProps) => MetricAggregate[] = ({
  query,
  query: { filters },
  valueGenerator,
  constraints
}) => {
  const emptyAggregates = generateEmptyAggregatesOverTime({ query })
  const dimensionCombinations = buildDimensionCombinations({
    dimensions: extractDimensionValuesFromMetricFilters({ filters }),
    constraints
  })
  const syntheticAggregates = splitEmptyMetricByDimensions({ emptyAggregates, dimensionCombinations })

  return hydrateDimensionValues({ syntheticAggregates, query, valueGenerator })
}
