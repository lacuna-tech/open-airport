import * as React from 'react'
import { getChartTheme, getTimeAxisFormatter, MetricInterval } from '@lacuna/ui-common'
import { useTheme } from '@material-ui/core'
import { LegendAnchor } from '@nivo/legends'
import { ResponsiveLine } from '@nivo/line'
import { TimeScale } from '@nivo/scales'
import { TickFormatter } from '@nivo/axes'
import { DateTime, Duration } from 'luxon'
import { ChartLegendOptions, Dimensions } from './types'

export type MetricsMultilineChartData = {
  id: string // also label
  data: { x: Date; y: number }[]
}
const horizontalBottomLegendOptions: ChartLegendOptions = {
  legend: [
    {
      anchor: 'bottom' as LegendAnchor,
      direction: 'row',
      itemWidth: 150,
      itemHeight: 20,
      translateY: 50,
      itemsSpacing: 0,
      itemDirection: 'top-to-bottom',
      symbolSize: 10,
      itemOpacity: 0.7
    }
  ],
  margin: {
    top: 10,
    right: 40,
    bottom: 80,
    left: 80
  }
}

const verticalLeftLegendOption: ChartLegendOptions = {
  legend: [
    {
      anchor: 'left' as LegendAnchor,
      direction: 'column',
      itemWidth: 150,
      itemHeight: 20,
      translateY: 0,
      translateX: -150,
      itemsSpacing: 0,
      itemDirection: 'left-to-right',
      symbolSize: 10,
      itemOpacity: 0.7
    }
  ],
  margin: {
    top: 10,
    right: 60,
    bottom: 80,
    left: 160
  }
}

const axisBottomMap: { [key in MetricInterval]: { tickValues: string; format: TickFormatter } } = {
  PT0S: {
    tickValues: 'every 15 minutes',
    format: getTimeAxisFormatter('hour', false)
  },
  PT15M: {
    tickValues: 'every 15 minutes',
    format: getTimeAxisFormatter('hour', false)
  },
  PT1H: {
    tickValues: 'every 2 hour',
    format: getTimeAxisFormatter('hour', true)
  },
  P1D: {
    tickValues: 'every 1 days',
    format: getTimeAxisFormatter('day', true)
  }
}

const getAxisBottom = (xAxisInterval: MetricInterval | undefined, diffDuration: Duration) => {
  if (!xAxisInterval) return axisBottomMap.PT15M

  const axisBottom = axisBottomMap[xAxisInterval]
  const durationDays = diffDuration.as('days')
  const durationHours = diffDuration.as('hours')
  if (durationDays >= 30) {
    return { ...axisBottom, tickValues: 'every 5 days' }
  }

  if (durationHours >= 36) {
    return { ...axisBottom, tickValues: 'every 4 hour' }
  }

  if (xAxisInterval === 'PT15M' && durationHours >= 6) {
    return { ...axisBottom, tickValues: 'every 1 hour' }
  }

  return axisBottom
}

export const MultilineChart = ({
  dimensions,
  data,
  xAxisInterval,
  useLeftLegend
}: {
  dimensions: Dimensions
  data: MetricsMultilineChartData[]
  xAxisInterval?: MetricInterval
  useLeftLegend?: boolean
}) => {
  const theme = useTheme()
  const { legend, margin } = useLeftLegend ? verticalLeftLegendOption : horizontalBottomLegendOptions
  const colors =
    data.length > 4 ? ({ scheme: 'paired' } as { scheme: 'paired' }) : ['#248DFF', '#09124F', '#BCE784', '#5DD39E']

  // Only render lenged for data being graphed
  const filteredData = data.filter(obj => obj.data.length > 0)

  const dateRange = data.map(d => d.data.map(inner => inner.x.getTime())).flat()
  const minDate = Math.min(...dateRange)
  const maxDate = Math.max(...dateRange)
  const diffDuration = DateTime.fromMillis(maxDate).diff(DateTime.fromMillis(minDate))

  const axisBottom = getAxisBottom(xAxisInterval, diffDuration)

  return (
    <div style={{ ...dimensions }}>
      <ResponsiveLine
        theme={getChartTheme(theme)}
        data={filteredData}
        enablePoints={false}
        enableSlices='x'
        useMesh={true}
        xScale={{ type: 'time', useUTC: false } as TimeScale}
        xFormat={'time:%m/%d'}
        yScale={{ type: 'linear', max: 'auto', min: 'auto' }}
        axisLeft={{ tickValues: 5 }}
        axisBottom={axisBottom}
        margin={margin}
        colors={colors}
        legends={legend}
      />
    </div>
  )
}
