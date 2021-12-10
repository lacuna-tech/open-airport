import React from 'react'
import {
  groupAndAggregateMetrics,
  MetricAggregate,
  MetricName,
  MetricDefinitionMap,
  getMetricValue
} from '@lacuna/ui-common'
import { BarExtendedDatum } from '@nivo/bar'
import { Box, Typography } from '@material-ui/core'
import { Stop } from '@material-ui/icons'
import { TIME_COMPARATOR_TYPE } from 'components'
import { Dimensions } from './types'
import { VersusBarChart, VersusChartDataOptions } from './VersusBarChart'
import { getDataLabel } from './helper'

export const SingleMetricVersusChart = ({
  aggregates,
  dimensions,
  measureName,
  timeComparator
}: {
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  measureName: MetricName
  timeComparator: TIME_COMPARATOR_TYPE
}) => {
  const [yesterday, today] = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  const metricLabel = MetricDefinitionMap[measureName].title
  const firstData: { [key: string]: number } = {}
  firstData[metricLabel] = parseFloat(getMetricValue({ name: measureName, aggregate: yesterday })!.toFixed(2))
  const secondData: { [key: string]: number } = {}
  secondData[metricLabel] = parseFloat(getMetricValue({ name: measureName, aggregate: today })!.toFixed(2))
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

  return <VersusBarChart {...{ chartData, dimensions, tooltip, label: metricLabel }} />
}
