import React from 'react'
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles'
import { ResponsiveBar } from '@nivo/bar'
import { AgencyKey } from '@lacuna/agency-config'
import { getChartTheme } from '@lacuna/ui-common'
import { AirportChartData, DashboardChartDemoProps } from './types'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 16
    }
  })
)

export const DailyFeesChartDemo: React.FC<DashboardChartDemoProps> = ({
  airports,
  data,
  dimensions
}: DashboardChartDemoProps) => {
  const classes = useStyles()
  const theme = useTheme()

  const todayTripFees = Object.keys(data).reduce<AirportChartData<number>>(
    (runningData, agency_key) => ({
      ...runningData,
      [agency_key]: data[agency_key as AgencyKey]!.fees
    }),
    {}
  )

  const yesterdayTripFees = Object.keys(data).reduce<AirportChartData<number>>(
    (runningData, agency_key) => ({
      ...runningData,
      [agency_key]: data[agency_key as AgencyKey]!.fees + data[agency_key as AgencyKey]!.fees * 0.15
    }),
    {}
  )

  const chartData = [
    {
      fee: 'Yesterday',
      ...yesterdayTripFees
    },
    {
      fee: 'Today',
      ...todayTripFees
    }
  ]
  const colors: { [key: string]: string } = { Today: '#248DFF', Yesterday: '#A0D1FF' }
  return (
    <div className={classes.root} style={{ ...dimensions }}>
      <ResponsiveBar
        data={chartData}
        theme={getChartTheme(theme)}
        keys={Object.values(airports).map(a => a.agency_key)}
        indexBy='fee'
        margin={{ top: 10, right: 70, bottom: 30, left: 70 }}
        padding={0.3}
        colors={(bar: { indexValue: string }) => colors[bar.indexValue]}
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
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  )
}
