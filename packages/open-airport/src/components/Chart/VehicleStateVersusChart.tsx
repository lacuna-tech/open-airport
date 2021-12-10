import React from 'react'
import {
  AirportEventMeasureNames,
  groupAndAggregateMetrics,
  MetricAggregate,
  MetricDefinitionMap,
  MetricName
} from '@lacuna/ui-common'
import { Box, Typography } from '@material-ui/core'
import { Stop } from '@material-ui/icons'
import { BarExtendedDatum } from '@nivo/bar'
import { TIME_COMPARATOR_TYPE } from 'components'
import { getDataLabel } from './helper'
import { Dimensions } from './types'
import { VersusBarChart, VersusChartDataOptions } from './VersusBarChart'

const measuresToExclude: Partial<MetricName>[] = [
  'airport.trips.count',
  'airport.fees.count',
  'airport.dwell.avg',
  'airport.passenger_connect_time.avg',
  ...AirportEventMeasureNames
]

export const VehicleStateVersusChart = ({
  aggregates,
  dimensions,
  timeComparator
}: {
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  timeComparator: TIME_COMPARATOR_TYPE
}) => {
  const [yesterday, today] = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  const firstMeasures = Object.keys(yesterday.measures).filter(key => !measuresToExclude.includes(key as MetricName))
  const secondMeasures = Object.keys(today.measures).filter(key => !measuresToExclude.includes(key as MetricName))

  const firstData: { [key: string]: number } = firstMeasures.reduce((acc, measure) => {
    const dataKey = MetricDefinitionMap[measure as MetricName].title
    return { ...acc, [dataKey]: yesterday.measures[measure as MetricName] }
  }, {})
  const secondData: { [key: string]: number } = secondMeasures.reduce((acc, measure) => {
    const dataKey = MetricDefinitionMap[measure as MetricName].title
    return { ...acc, [dataKey]: today.measures[measure as MetricName] }
  }, {})

  const labels = getDataLabel(timeComparator)
  const chartData: VersusChartDataOptions = {
    first: {
      label: labels.first,
      data: firstData
    },
    second: {
      label: labels.second,
      data: secondData
    }
  }
  const tooltip = ({ id, value, color, indexValue }: BarExtendedDatum) => {
    const dayText = indexValue === chartData.first.label ? chartData.second.label : chartData.first.label
    const percentDiff =
      (indexValue === chartData.second.label
        ? (secondData[id] - firstData[id]) / firstData[id]
        : (firstData[id] - secondData[id]) / secondData[id]) * 100
    return (
      <Box display='flex' flexDirection='column'>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box display='flex' alignItems='center'>
            <Stop style={{ color }} />
            <Typography variant='body2'>{id}:</Typography>
          </Box>
          <Typography variant='subtitle2'>{value}</Typography>
        </Box>
        <Box>
          <Typography variant='caption'>
            {Math.abs(percentDiff).toFixed(2)}% {percentDiff < 0 ? 'decrease' : 'increase'} from {dayText}{' '}
          </Typography>
        </Box>
      </Box>
    )
  }
  return (
    <VersusBarChart
      {...{
        chartData,
        dimensions,
        useLeftLegend: true,
        tooltip
      }}
    />
  )
}
