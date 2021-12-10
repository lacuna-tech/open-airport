/**
 * Chart for drawing a single line, including baseline.
 */
import React from 'react'
import { TimeScale } from '@nivo/scales'
import { ResponsiveLine } from '@nivo/line'

import { SingleChartProps, getTimeAxisFormatter } from './chartUtils'
import { useSingleLineChartTooltip } from './LineChartTooltip'

export default function Sparkline(props: SingleChartProps) {
  const {
    dataSet,
    defaultMaxValue = 100,
    timeAxisFormatter = dataSet,
    showTimesAsRanges = false,
    timeAxisTickValues
  } = props

  const getSliceTooltip = useSingleLineChartTooltip(dataSet, showTimesAsRanges)
  const data = React.useMemo(() => {
    if (!dataSet) return null
    return dataSet.getNivoTimeLineData()
  }, [dataSet])

  if (!data || !dataSet) return null
  // Are ALL values 0?  If so, we'll manually scale the graph.
  const { range } = dataSet

  return (
    <ResponsiveLine
      data={data}
      colors={['#027abb', '#000000']}
      enablePoints={false}
      margin={{ top: 5, right: 5, bottom: 25, left: 50 }}
      enableGridX={false}
      xScale={
        {
          type: 'time',
          useUTC: false
        } as TimeScale
      }
      xFormat='time:%Y-%m-%d'
      enableGridY={false}
      yScale={{
        type: 'linear',
        max: range.min === 0 && range.max === 0 ? defaultMaxValue : 'auto'
      }}
      axisLeft={{
        tickValues: 1,
        format(value) {
          return dataSet.metric.format(value) as string
        }
      }}
      axisBottom={{
        format: getTimeAxisFormatter(timeAxisFormatter, showTimesAsRanges),
        tickValues: timeAxisTickValues
      }}
      useMesh={true}
      enableSlices='x'
      sliceTooltip={getSliceTooltip}
    />
  )
}
