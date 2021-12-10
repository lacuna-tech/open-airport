import React from 'react'
import type { METRICS_TRANSACTION_TYPE } from '@lacuna-core/mds-metrics-service'
import { groupAndAggregateMetrics, MetricAggregate } from '@lacuna/ui-common'
import { Box, Paper, Typography } from '@material-ui/core'
import { Stop } from '@material-ui/icons'
import { BarExtendedDatum } from '@nivo/bar'
import { TIME_COMPARATOR_TYPE } from 'components'
import { getDataLabel } from './helper'
import { Dimensions } from './types'
import { VersusBarChart, VersusChartDataOptions } from './VersusBarChart'

export const PudoTripsChart = ({
  aggregates,
  dimensions,
  timeComparator
}: {
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  timeComparator: TIME_COMPARATOR_TYPE
}) => {
  // Group and aggregate based on pick-up/drop-off
  const [yesterday, today] = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  const getDailyPuDo = (agg: MetricAggregate, transaction_type: METRICS_TRANSACTION_TYPE) =>
    agg.aggregates
      .filter(innerAgg => innerAgg.dimensions.transaction_type === transaction_type)
      .reduce((acc, filteredAgg) => acc + (filteredAgg.measures['airport.trips.count'!] || 0), 0)

  const yesterdayData: { [key: string]: number } = {
    'Enter Jurisdiction': yesterday.measures['airport.event.enter_jurisdiction.count'] || 0,
    'Leave Jurisdiction': yesterday.measures['airport.event.leave_jurisdiction.count'] || 0,
    'Pick-Ups': getDailyPuDo(yesterday, 'pick_up'),
    'Drop-Offs': getDailyPuDo(yesterday, 'drop_off')
  }
  const todayData: { [key: string]: number } = {
    'Enter Jurisdiction': today.measures['airport.event.enter_jurisdiction.count'] || 0,
    'Leave Jurisdiction': today.measures['airport.event.leave_jurisdiction.count'] || 0,
    'Pick-Ups': getDailyPuDo(today, 'pick_up'),
    'Drop-Offs': getDailyPuDo(today, 'drop_off')
  }

  const labels = getDataLabel(timeComparator)
  const chartData: VersusChartDataOptions = {
    first: {
      data: yesterdayData,
      label: labels.first
    },
    second: {
      data: todayData,
      label: labels.second
    }
  }

  const tooltip = ({ id, value, color, indexValue }: BarExtendedDatum) => {
    const dayText = indexValue === chartData.first.label ? chartData.second.label : chartData.first.label
    const percentDiff =
      (indexValue === chartData.second.label
        ? (todayData[id] - yesterdayData[id]) / yesterdayData[id]
        : (yesterdayData[id] - todayData[id]) / todayData[id]) * 100
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
    <Paper>
      <VersusBarChart {...{ chartData, dimensions, tooltip }} />
    </Paper>
  )
}
