/**
 * Chart for drawing a single line for each provider.
 * TODO: add baseline support.
 */
import React from 'react'
import flatten from 'lodash/flatten'

import { TimeScale } from '@nivo/scales'
import { ResponsiveLine } from '@nivo/line'

import { MetricDataSet } from '../../metrics'
import { MultiChartProps, getTimeAxisFormatter } from './chartUtils'
import { useProvidersLineChartTooltip } from './LineChartTooltip'

export default function ProvidersLineChart(props: MultiChartProps) {
  const {
    dataSets: providerDataSets,
    stacked = false,
    showArea = false,
    defaultMaxValue = 100,
    timeAxisFormatter = providerDataSets[0],
    showTimesAsRanges = false,
    timeAxisTickValues
  } = props

  const data = React.useMemo(() => {
    if (providerDataSets.length === 0) return null
    return flatten(
      providerDataSets.map(providerDataSet =>
        providerDataSet.getNivoTimeLineData({ includeSLA: false, title: providerDataSet.providerName })
      )
    )
  }, [providerDataSets])

  // Get sliceTooltip according to the first dataSet (assuming all dataSets match this.)
  const getSliceTooltip = useProvidersLineChartTooltip(providerDataSets[0], showTimesAsRanges)

  if (!data) return null

  // Are ALL values 0?  If so, we'll manually scale the graph.
  const range = MetricDataSet.getRangeForSets(providerDataSets)

  return (
    <ResponsiveLine
      data={data}
      colors={{ scheme: 'nivo' }}
      enableArea={showArea}
      areaOpacity={0.5}
      margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
      pointSize={0}
      xScale={
        {
          type: 'time',
          useUTC: false
        } as TimeScale
      }
      xFormat='time:%Y-%m-%d'
      yScale={{
        type: 'linear',
        stacked,
        max: range.min === 0 && range.max === 0 ? defaultMaxValue : 'auto'
      }}
      // yFormat={value => metric.format(value as MetricValue) as string | number}
      curve='monotoneY'
      axisLeft={{
        tickValues: 5,
        format(value) {
          return providerDataSets[0].metric.format(value) as string
        }
      }}
      axisBottom={{
        format: getTimeAxisFormatter(timeAxisFormatter, showTimesAsRanges),
        tickValues: timeAxisTickValues
      }}
      enableSlices='x'
      sliceTooltip={getSliceTooltip}
      // tooltip={tooltip}
      legends={[
        {
          anchor: 'bottom-left',
          direction: 'row',
          itemWidth: 60,
          itemHeight: 20,
          translateY: 60,
          symbolSize: 10
        }
      ]}
      theme={{
        tooltip: {}
      }}
      useMesh={true}
    />
  )
}
