import {
  AirportVehicleStateMeasureNames,
  Dimensions,
  groupAndAggregateMetrics,
  MetricAggregate,
  MetricDefinitionMap,
  MetricInterval
} from '@lacuna/ui-common'
import React from 'react'
import { MetricsMultilineChartData, MultilineChart } from './MultilineChart'

export const VehicleStateMultilChart = ({
  aggregates,
  dimensions,
  metricInterval
}: {
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  metricInterval: MetricInterval
}) => {
  const dataMap: { [key: string]: MetricsMultilineChartData } = {}
  AirportVehicleStateMeasureNames.forEach(measure => {
    dataMap[measure] = { id: MetricDefinitionMap[measure].title, data: [] }
  })
  const groupedAgg = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  groupedAgg.forEach(agg => {
    Object.keys(agg.measures).map(measure => {
      if (dataMap[measure]) {
        dataMap[measure].data.push({
          x: new Date(agg.time_bin_start),
          y: (agg.measures as { [key: string]: number })[measure]
        })
      }
    })
  })
  const data = Object.values(dataMap)
  return <MultilineChart {...{ data, dimensions, useLeftLegend: true, xAxisInterval: metricInterval }} />
}
