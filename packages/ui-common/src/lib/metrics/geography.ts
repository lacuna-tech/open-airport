import { aggregateMetrics, groupMetricsByDimension } from './aggregation'
import { MetricAggregate } from './types'

export type GeographyMetricAggregateMap = {
  [key: string]: MetricAggregate | undefined
}

export const groupAndAggregateMetricsByGeography: (options: {
  aggregates: MetricAggregate[]
}) => GeographyMetricAggregateMap | undefined = ({ aggregates }) =>
  aggregates.length > 0
    ? Object.entries(
        groupMetricsByDimension({ aggregates, dimension: 'geography_id' })
      ).reduce<GeographyMetricAggregateMap>(
        (accumlated, [geography_id, aggregatesOfJurisdiction]) => ({
          ...accumlated,
          [geography_id]:
            aggregatesOfJurisdiction.length > 0 ? aggregateMetrics({ aggregates: aggregatesOfJurisdiction }) : undefined
        }),
        {}
      )
    : undefined
