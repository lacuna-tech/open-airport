import * as React from 'react'
import { createStyles, makeStyles, useTheme, Typography } from '@material-ui/core'
import { LegendAnchor } from '@nivo/legends'
import { ResponsiveLine, SliceTooltipProps } from '@nivo/line'
import { TimeScale } from '@nivo/scales'
import { DateTime } from 'luxon'
import { ChartLegendOptions, Dimensions } from './types'
import { getTimeAxisFormatter, getChartTheme } from '../charts'
import { MetricInterval } from '../../lib/metrics'

const useStyles = makeStyles(
  theme =>
    createStyles({
      providerIconLegend: {
        width: 14,
        height: 14,
        marginRight: theme.spacing(2),
        borderRadius: 14
      },
      tooltipContainer: {
        backgroundColor: 'white',
        boxShadow: '1px 1px 5px black'
      },
      tooltipDate: {
        fontSize: theme.typography.subtitle2.fontSize,
        padding: theme.spacing(1)
      },
      tooltipItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 5
      },

      tooltipItemText: {
        fontWeight: 500
      },
      tooltipRowContainer: {
        padding: theme.spacing(1)
      },
      tooltipTotal: {
        padding: theme.spacing(2)
      }
    }),
  { name: 'MultilineChart' }
)

export type MetricsMultilineChartData = {
  id: string // also label
  data: { x: Date; y: number }[]
  color?: string
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
    right: 30,
    bottom: 40,
    left: 160
  }
}

const axisIntervalMap = {
  PT0S: {
    tickValues: 'every 1 hour',
    format: getTimeAxisFormatter('hour', false)
  },
  PT15M: {
    tickValues: 'every 1 hour',
    format: getTimeAxisFormatter('hour', false)
  },
  PT1H: {
    tickValues: 'every 3 hour',
    format: getTimeAxisFormatter('hour', false)
  },
  P1D: {
    tickValues: 'every 1 day',
    format: getTimeAxisFormatter('day', true)
  }
}

const SliceTooltip = ({ slice }: SliceTooltipProps) => {
  const classes = useStyles()
  let date
  if (slice.points[0] && slice.points[0].data.x instanceof Date) {
    date = DateTime.fromJSDate(slice.points[0].data.x).toFormat('h:mm a, MM/d')
  }
  const total = slice.points.reduce((sum, point) => {
    if (typeof point.data.y === 'number') {
      return sum + point.data.y
    }
    return sum
  }, 0)
  return (
    <div className={classes.tooltipContainer}>
      <Typography className={classes.tooltipDate}>{date}</Typography>
      <div className={classes.tooltipRowContainer}>
        {slice.points.map(point => {
          return (
            <div key={point.serieId} className={classes.tooltipItem}>
              <div
                className={classes.providerIconLegend}
                style={{
                  backgroundColor: point.serieColor || '#000'
                }}
              />
              <Typography className={classes.tooltipItemText}>
                {point.serieId}: {point.data.y}
              </Typography>
            </div>
          )
        })}
      </div>
      <hr />
      <Typography variant='subtitle2' className={classes.tooltipTotal}>
        Total: {total}
      </Typography>
    </div>
  )
}

export const MultilineChart = ({
  dimensions,
  data,
  xAxisInterval,
  useLeftLegend,
  disableLegend
}: {
  dimensions: Dimensions
  data: MetricsMultilineChartData[]
  xAxisInterval?: MetricInterval
  useLeftLegend?: boolean
  disableLegend?: boolean
}) => {
  const theme = useTheme()
  const { legend, margin } = useLeftLegend ? verticalLeftLegendOption : horizontalBottomLegendOptions
  const colors = data.map(d => d.color || '#FFFFFF')
  const filteredData = data.filter(obj => obj.data.length > 0)
  const axisBottom = axisIntervalMap[xAxisInterval || 'PT1H']

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
        legends={disableLegend ? undefined : legend}
        sliceTooltip={SliceTooltip}
      />
    </div>
  )
}
