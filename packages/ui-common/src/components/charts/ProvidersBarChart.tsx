/**
 * Chart for drawing a single line for each providerDataSet.
 * TODO: add baseline support.
 */
import React from 'react'
import { CartesianMarkerProps } from '@nivo/core'
import { ResponsiveBar } from '@nivo/bar'

import { MetricDataSet, aggregateValues } from '../../metrics'
import { MultiChartProps } from './chartUtils'
import { useProvidersBarChartTooltip } from './BarChartTooltip'

export default function ProvidersBarChart({
  dataSets: providerDataSets,
  showTimesAsRanges = false,
  showMarker = true,
  markerTitle = 'SLA value',
  defaultMaxValue = 100
}: MultiChartProps) {
  const getSliceTooltip = useProvidersBarChartTooltip(providerDataSets[0])

  if (providerDataSets.length === 0) return null

  const data = MetricDataSet.getProvidersBarData(providerDataSets, showTimesAsRanges)
  let maxValue: number | undefined
  const markers: CartesianMarkerProps[] = []
  if (showMarker) {
    const markerValue = MetricDataSet.getProvidersMarkerData(providerDataSets)
    if (typeof markerValue === 'number') {
      markers.push({
        axis: 'y',
        value: markerValue,
        lineStyle: { stroke: 'rgba(0, 0, 0, .75)', strokeWidth: 1 },
        legend: markerTitle
      } as CartesianMarkerProps)

      // Set `maxValue` explicitly to make sure the marker actually shows up.
      const { rowAggregator } = providerDataSets[0].metric
      const providerValues = data.map(providerDataSet => {
        const [, /* skip time column */ ...values] = Object.values(providerDataSet)
        const aggregate = aggregateValues(values, rowAggregator, 0)
        return typeof aggregate === 'number' ? aggregate : 0
      })
      maxValue = Math.max(markerValue, ...providerValues)
    }
  }
  // Are ALL values 0?  If so, we'll manually scale the graph.
  const range = MetricDataSet.getRangeForSets(providerDataSets)
  if (maxValue === undefined && range.min === 0 && range.max === 0) maxValue = defaultMaxValue

  return (
    <ResponsiveBar
      data={data}
      indexBy='time'
      keys={providerDataSets.map(providerDataSet => providerDataSet.providerName)}
      margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
      colors={{ scheme: 'nivo' }}
      enableLabel={false}
      markers={markers}
      maxValue={maxValue}
      tooltip={getSliceTooltip}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-left',
          direction: 'row',
          itemWidth: 60,
          itemHeight: 20,
          translateY: 60,
          symbolSize: 10
        }
      ]}
      axisLeft={{
        tickValues: 5,
        format(value) {
          return providerDataSets[0].metric.format(value) as string
        }
      }}
    />
  )
}
