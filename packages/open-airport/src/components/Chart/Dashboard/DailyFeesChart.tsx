import React from 'react'
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles'
import { Theme } from '@material-ui/core'
import { ResponsiveBar } from '@nivo/bar'
import { getChartTheme } from '@lacuna/ui-common'
import { DashboardChartProps } from './types'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 16
    }
  })
)

// Change text color based on bar color
const colorLabelMap = (theme: Theme): { [key: string]: string } => ({
  '#248DFF': '#F8F7FF',
  '#09124F': '#F8F7FF',
  '#BCE784': theme.palette.primary.dark,
  '#5DD39E': theme.palette.primary.dark
})

export const DailyFeesChart: React.FC<DashboardChartProps> = ({
  yesterdaysAggregate,
  todaysAggregate,
  dimensions
}: DashboardChartProps) => {
  const classes = useStyles()
  const theme = useTheme()

  const chartData = [
    {
      day: 'Yesterday',
      fees: yesterdaysAggregate.measures['airport.fees.count'] || 0
    },
    {
      day: 'Today',
      fees: todaysAggregate.measures['airport.fees.count'] || 0
    }
  ]

  return (
    <div className={classes.root} style={{ ...dimensions }}>
      <ResponsiveBar
        data={chartData}
        theme={getChartTheme(theme)}
        keys={['fees']}
        indexBy='day'
        margin={{ top: 10, right: 70, bottom: 30, left: 70 }}
        padding={0.3}
        colors={data => {
          return data.index === 0 ? '#248DFF' : '#09124F'
        }}
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
          legend: 'fees',
          legendPosition: 'middle',
          legendOffset: -60
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={datum => colorLabelMap(theme as Theme)[datum.color]}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  )
}
