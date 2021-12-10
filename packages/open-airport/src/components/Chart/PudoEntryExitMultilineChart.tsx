import React from 'react'
import { groupAndAggregateMetrics, MetricAggregate, MetricInterval, sortMetrics } from '@lacuna/ui-common'
import { MetricsMultilineChartData, MultilineChart } from './MultilineChart'
import { Dimensions } from './types'

export const PudoEntryExitMultilineChart = ({
  aggregates,
  dimensions,
  metricInterval
}: {
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  metricInterval: MetricInterval
}) => {
  const groupedMetrics = groupAndAggregateMetrics(aggregates, aggregate => aggregate.dimensions.transaction_type!)

  const pickupAgg = groupedMetrics.find(agg =>
    agg.aggregates.find(innerAgg => innerAgg.dimensions.transaction_type?.includes('pick_up'))
  )

  const sortedPickup = sortMetrics(pickupAgg?.aggregates || [], agg => agg.time_bin_start)
  const dropoffAgg = groupedMetrics.find(agg =>
    agg.aggregates.find(innerAgg => innerAgg.dimensions.transaction_type?.includes('drop_off'))
  )

  const sortedDropoff = sortMetrics(dropoffAgg?.aggregates || [], agg => agg.time_bin_start)

  const pickupData: MetricsMultilineChartData = {
    id: 'Pick-Ups',
    data: groupAndAggregateMetrics(sortedPickup, agg => agg.time_bin_start_formatted || agg.time_bin_start).map(
      agg => ({
        x: new Date(agg.time_bin_start),
        y: agg.measures['airport.trips.count'] || 0
      })
    )
  }
  const dropoffData: MetricsMultilineChartData = {
    id: 'Drop-Offs',
    data: groupAndAggregateMetrics(sortedDropoff, agg => agg.time_bin_start_formatted || agg.time_bin_start).map(
      agg => ({
        x: new Date(agg.time_bin_start),
        y: agg.measures['airport.trips.count'] || 0
      })
    )
  }

  // Group and aggregate based on time_bin_start to get enter/leave events (NOT grouped by transaction_type)
  const eventAgg = sortMetrics(
    groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start_formatted || agg.time_bin_start),
    agg => agg.time_bin_start
  )

  const enterData: MetricsMultilineChartData = {
    id: 'Enter Jurisdiction',
    data: eventAgg.map(agg => ({
      x: new Date(agg.time_bin_start),
      y: agg.measures['airport.event.enter_jurisdiction.count'] || 0
    }))
  }

  const leaveData: MetricsMultilineChartData = {
    id: 'Leave Jurisdiction',
    data: eventAgg.map(agg => ({
      x: new Date(agg.time_bin_start),
      y: agg.measures['airport.event.leave_jurisdiction.count'] || 0
    }))
  }

  const data = [enterData, leaveData, pickupData, dropoffData]
  return <MultilineChart {...{ data, dimensions, xAxisInterval: metricInterval }} />
}
