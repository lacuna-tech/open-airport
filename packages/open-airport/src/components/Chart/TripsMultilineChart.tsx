import { groupAndAggregateMetrics } from '@lacuna/ui-common'
import { Dimensions } from 'components'
import { generateFakeMetricsAggregate } from 'lib'
import React from 'react'
import { MultilineChart } from './MultilineChart'

export const TripsMultilineChart = ({ dimensions }: { dimensions: Dimensions }) => {
  const aggregates = generateFakeMetricsAggregate('PT1H')
  const tripAgg = groupAndAggregateMetrics(aggregates, agg => agg.time_bin_start)
  const tripData = {
    id: 'Total Trips',
    data: tripAgg.map(agg => ({ x: new Date(agg.time_bin_start), y: agg.measures['airport.trips.count']! }))
  }
  return <MultilineChart {...{ data: [tripData], dimensions }} />
}
