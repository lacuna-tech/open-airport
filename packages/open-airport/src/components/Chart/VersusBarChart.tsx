import React from 'react'
import { getChartTheme } from '@lacuna/ui-common'
import { Box, createStyles, makeStyles, Paper, Theme, Typography } from '@material-ui/core'
import { ResponsiveBar, TooltipProp } from '@nivo/bar'
import { LegendAnchor, LegendProps } from '@nivo/legends'
import { OrdinalColorScaleConfig } from '@nivo/colors'
import { useTheme } from '@material-ui/styles'
import { Stop } from '@material-ui/icons'
import { ChartLegendOptions, Dimensions } from './types'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 16
    }
  })
)

type VersusChartData = {
  label: string
  data: { [key: string]: number }
}

// Change text color based on bar color
const colorLabelMap = (theme: Theme): { [key: string]: string } => ({
  '#248DFF': '#F8F7FF',
  '#09124F': '#F8F7FF',
  '#BCE784': theme.palette.primary.dark,
  '#5DD39E': theme.palette.primary.dark
})

const horizontalBottomLegendOptions: ChartLegendOptions & {
  legend: Array<LegendProps & { dataFrom: 'keys' | 'indexes' }>
} = {
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
      itemOpacity: 0.7,
      dataFrom: 'keys'
    }
  ],
  margin: {
    top: 10,
    right: 40,
    bottom: 120,
    left: 80
  }
}

const verticalLeftLegendOption: ChartLegendOptions & {
  legend: Array<LegendProps & { dataFrom: 'keys' | 'indexes' }>
} = {
  legend: [
    {
      anchor: 'left' as LegendAnchor,
      data: [
        {
          id: '1',
          label: 'test'
        },
        {
          id: '2',
          label: 'bar'
        }
      ],
      dataFrom: 'keys',
      direction: 'column',
      itemWidth: 150,
      itemHeight: 20,
      translateY: 70,
      translateX: -200,
      itemsSpacing: 0,
      itemDirection: 'left-to-right',
      symbolSize: 10,
      itemOpacity: 0.7
    }
  ],
  margin: {
    top: 10,
    right: 40,
    bottom: 80,
    left: 200
  }
}

const getSumComparators = (chartData: VersusChartDataOptions) => {
  const firstSum = Object.keys(chartData.first.data).reduce((acc, key) => acc + chartData.first.data[key], 0)
  const secondSum = Object.keys(chartData.second.data).reduce((acc, key) => acc + chartData.second.data[key], 0)
  const diff = ((secondSum - firstSum) / secondSum) * 100
  const incDec = diff > 0 ? 'increase' : 'decrease'
  const diffText = `${Math.abs(diff).toFixed(2)}% ${incDec} from ${chartData.first.label}`
  return (
    <Box style={{ display: 'flex', marginBottom: 16, width: '100%', justifyContent: 'center' }}>
      <Box style={{ width: 300 }} display='flex' alignItems='center' justifyContent='center' flexDirection='column'>
        <Typography variant='subtitle2'>{chartData.first.label} Total</Typography>
        <Typography variant='body2'>{firstSum}</Typography>
      </Box>
      <Box>{diffText}</Box>
      <Box style={{ width: 300 }} display='flex' alignItems='center' justifyContent='center' flexDirection='column'>
        <Typography variant='subtitle2'>{chartData.second.label} Total</Typography>
        <Typography variant='body2'>{secondSum}</Typography>
      </Box>
    </Box>
  )
}

export type VersusChartDataOptions = {
  first: VersusChartData
  second: VersusChartData
}

export const VersusBarChart = ({
  chartData,
  dimensions,
  tooltip,
  useLeftLegend,
  label
}: {
  chartData: VersusChartDataOptions
  dimensions: Dimensions
  tooltip?: TooltipProp | undefined
  useLeftLegend?: boolean
  label?: string
}) => {
  const classes = useStyles()
  const theme = useTheme()
  const data = [
    { ...chartData.first.data, label: chartData.first.label },
    { ...chartData.second.data, label: chartData.second.label }
  ]
  const dataLength = Object.keys(chartData.first.data).length
  const useLegend = dataLength > 4
  const colorArr = ['#248DFF', '#09124F', '#BCE784', '#5DD39E']
  const { legend, margin } = useLeftLegend ? verticalLeftLegendOption : horizontalBottomLegendOptions

  const percentDiffs = Object.keys(chartData.first.data).map(dk => {
    const diff = ((chartData.second.data[dk] - chartData.first.data[dk]) / chartData.first.data[dk]) * 100
    const incDec = diff > 0 ? 'increase' : 'decrease'
    return `${Math.abs(diff).toFixed(2)}% ${incDec} from ${chartData.first.label}`
  })

  // Use index value for coloration for single measure values
  const colorHandler = (d: { index: number }) => {
    return colorArr[d.index]
  }
  const getColors = (): OrdinalColorScaleConfig => {
    if (dataLength === 1) {
      return colorHandler
    }
    if (dataLength > 4) {
      return { scheme: 'paired' }
    }
    return colorArr
  }

  const colors = getColors()

  return (
    <Paper className={classes.root} style={{ ...dimensions }}>
      <Box style={{ height: '90%' }}>
        <ResponsiveBar
          data={data}
          theme={getChartTheme(theme as Theme)}
          keys={Object.keys(chartData.first.data)}
          indexBy='label'
          margin={margin}
          padding={0.3}
          colors={colors}
          defs={[
            {
              id: 'dots',
              type: 'patternDots',
              background: 'inherit',
              color: '#38bcb2',
              size: 4,
              padding: 1,
              stagger: true
            },
            {
              id: 'lines',
              type: 'patternLines',
              background: 'inherit',
              color: '#eed312',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
            }
          ]}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: label,
            legendPosition: 'middle',
            legendOffset: -60
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={datum => colorLabelMap(theme as Theme)[datum.color]}
          tooltip={tooltip}
          legends={useLegend ? legend : undefined}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </Box>

      <Box style={{ display: 'flex', marginBottom: 16, width: '100%', justifyContent: 'center' }}>
        {dataLength > 4 && getSumComparators(chartData)}
        {!useLegend &&
          Object.keys(chartData.first.data).map((key, idx) => (
            <Box
              key={key}
              style={{ width: 300 }}
              display='flex'
              alignItems='center'
              justifyContent='center'
              flexDirection='column'
            >
              {dataLength > 1 && <Stop style={{ color: colorArr[idx] }} />}
              <Typography variant='subtitle2'>{key}</Typography>
              <Typography variant='body2'>{percentDiffs[idx]}</Typography>
            </Box>
          ))}
      </Box>
    </Paper>
  )
}
