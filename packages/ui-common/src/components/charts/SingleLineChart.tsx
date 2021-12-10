/**
 * Chart for drawing a single line, including SLA baseline.
 */
import React from 'react'
import { TimeScale } from '@nivo/scales'
import { ResponsiveLine } from '@nivo/line'
import { useTheme } from '@material-ui/core'

import { SingleChartProps, getTimeAxisFormatter } from './chartUtils'
import { useSingleLineChartTooltip } from './LineChartTooltip'
import getChartTheme from './getChartTheme'

export default function SingleLineChart(props: SingleChartProps) {
  const theme = useTheme()

  const {
    dataSet,
    defaultMaxValue = 100,
    timeAxisFormatter = dataSet,
    showTimesAsRanges = false,
    timeAxisTickValues,
    binSize
  } = props
  const getSliceTooltip = useSingleLineChartTooltip(dataSet, showTimesAsRanges)

  // Get sliceTooltip according to the first dataSet (assuming all dataSets match this.)
  const data = React.useMemo(() => {
    if (!dataSet) return null
    return dataSet.getNivoTimeLineData(/* { separateSLA: true } */)
  }, [dataSet])

  if (!data || !dataSet) return null

  // Are ALL values 0?  If so, we'll manually scale the graph.
  const { range } = dataSet

  return (
    <ResponsiveLine
      data={data}
      theme={getChartTheme(theme)}
      colors={['#027abb', 'rgba(0,0,0,0.4)']}
      lineWidth={2}
      enablePoints={false}
      margin={{ top: 20, right: 40, bottom: 40, left: 80 }}
      xScale={
        {
          type: 'time',
          useUTC: false
        } as TimeScale
      }
      xFormat={binSize === 'month' ? 'time:%m' : 'time:%m/%d'}
      yScale={{
        type: 'linear',
        stacked: false,
        max: range.min === 0 && range.max === 0 ? defaultMaxValue : 'auto'
      }}
      axisLeft={{
        tickValues: 5,
        format(value) {
          return dataSet.metric.format(value) as string
        }
      }}
      axisBottom={{
        format: getTimeAxisFormatter(timeAxisFormatter, showTimesAsRanges),
        tickValues: binSize ? `every 1 ${binSize}` : timeAxisTickValues
      }}
      useMesh={true}
      enableSlices='x'
      sliceTooltip={getSliceTooltip}
    />
  )
}
