import React from 'react'
import { groupAndAggregateMetrics, MetricAggregate, MetricInterval, MetricName } from '@lacuna/ui-common'
import { Dimensions } from 'components'
import { MultilineChart } from './MultilineChart'

export const SingleMetricLineChart = ({
  aggregates,
  dataLabel,
  dimensions,
  measureName,
  metricInterval
}: {
  aggregates: MetricAggregate[]
  dataLabel: string
  dimensions: Dimensions
  measureName: MetricName
  metricInterval: MetricInterval
}) => {
  const dataAgg = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  const data = {
    id: dataLabel,
    data: dataAgg.map(agg => ({
      x: new Date(agg.time_bin_start),
      y: parseFloat(agg.measures[measureName]!.toFixed(2))
    }))
  }

  return <MultilineChart {...{ data: [data], dimensions, xAxisInterval: metricInterval }} />
}
