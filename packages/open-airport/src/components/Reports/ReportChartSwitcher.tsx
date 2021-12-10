import React from 'react'
import {
  AirportEventMeasureNames,
  AirportVehicleStateMeasureNames,
  CenteredLoadingSpinner,
  Dimensions,
  LiteralArray,
  LoadState,
  MetricInterval,
  MetricName,
  useMetrics
} from '@lacuna/ui-common'
import { PudoEntryExitMultilineChart } from 'components/Chart/PudoEntryExitMultilineChart'
import {
  ChartContainer,
  FilterState,
  MetricsTable,
  PudoTripsChart,
  SingleMetricLineChart,
  SingleMetricVersusChart,
  VehicleEventMultilineChart,
  VehicleEventVersusChart,
  VehicleStateMultilChart,
  VehicleStateVersusChart
} from 'components'
import { DateTime } from 'luxon'
import { useMetricsTuple } from '@lacuna/ui-common/src/store/metricsV2'
import { builderMetricQueryFilters, getTimeRangeAndInterval } from 'components/Filters/helper'
import { CHART_TYPE, GRAPH_TYPE, TIME_COMPARATOR_TYPE } from './types'

const MultilineChart: React.FC<{
  graphType: GRAPH_TYPE
  dimensions: Dimensions
  filterState: FilterState
}> = ({ graphType, dimensions, filterState }) => {
  const { start_date, end_date, interval } = getTimeRangeAndInterval(filterState.time_range)

  const {
    result: { aggregates, loadState }
  } = useMetrics(() => {
    const rawMeasures = [
      'airport.trips.count',
      'airport.fees.count',
      'airport.passenger_connect_time.avg',
      'airport.dwell.avg',
      ...LiteralArray<MetricName>(AirportEventMeasureNames),
      ...LiteralArray<MetricName>(AirportVehicleStateMeasureNames)
    ] as Partial<MetricName>[]

    const { filters, filteredMeasures } = builderMetricQueryFilters({
      filterState,
      measures: rawMeasures
    })

    return {
      key: `report-chart-multiline`,
      query: {
        measures: filteredMeasures ?? rawMeasures,
        filters,
        interval,
        start_date,
        end_date,
        dimensions: ['transaction_type']
      },
      active: true,
      salt: 0,
      // Note: dimensionValues must include all the possible values for ONLY the dimensions specified in the query. TODO: Replace this with the actual query dimensions to enforce / avoid confusion.
      dimensionValues: {
        transaction_type: ['pick_up', 'drop_off', null]
      }
    }
  }, [filterState, start_date, end_date, interval])
  if (loadState === LoadState.loading) {
    return <CenteredLoadingSpinner />
  }

  switch (graphType) {
    case 'pudo_vs_enter_exit':
      return <PudoEntryExitMultilineChart {...{ aggregates, dimensions, metricInterval: interval }} />
    case 'total_trips':
      return (
        <SingleMetricLineChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.trips.count',
            dataLabel: 'Total Trips',
            metricInterval: interval
          }}
        />
      )
    case 'total_fees':
      return (
        <SingleMetricLineChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.fees.count',
            dataLabel: 'Total Fees',
            metricInterval: interval
          }}
        />
      )
    case 'average_connect_time':
      return (
        <SingleMetricLineChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.passenger_connect_time.avg',
            dataLabel: 'Average Passenger Connect Time (Mins)',
            metricInterval: interval
          }}
        />
      )
    case 'average_dwell_time':
      return (
        <SingleMetricLineChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.dwell.avg',
            dataLabel: 'Average Dwell Time (Mins)',
            metricInterval: interval
          }}
        />
      )
    case 'events_by_type':
      return <VehicleEventMultilineChart {...{ aggregates, dimensions, metricInterval: interval }} />
    case 'vehicle_state_by_type':
      return <VehicleStateMultilChart {...{ aggregates, dimensions, metricInterval: interval }} />
    default:
      return <></>
  }
}

const BarChart: React.FC<{
  graphType: GRAPH_TYPE
  dimensions: Dimensions
  filterState: FilterState
  timeComparator: TIME_COMPARATOR_TYPE
}> = ({ graphType, dimensions, filterState, timeComparator }) => {
  const {
    previous: { aggregates: previousAggregates },
    current: { aggregates: currentAggregates },
    loadState
  } = useMetricsTuple(() => {
    const intervalMap: { [key in TIME_COMPARATOR_TYPE]: () => MetricInterval } = {
      today_yesterday: () => 'P1D',
      today_last_week: () => 'P1D',
      hour_last_week: () => 'PT1H'
    }

    const timeRangesMap = {
      today_yesterday: () => ({
        previousTimeRange: {
          start_date: DateTime.now().startOf('day').minus({ day: 1 }).valueOf(),
          end_date: DateTime.now().endOf('day').minus({ day: 1 }).valueOf()
        },
        currentTimeRange: {
          start_date: DateTime.now().startOf('day').valueOf(),
          end_date: DateTime.now().endOf('day').valueOf()
        }
      }),
      today_last_week: () => ({
        previousTimeRange: {
          start_date: DateTime.now().startOf('day').minus({ week: 1 }).valueOf(),
          end_date: DateTime.now().endOf('day').minus({ week: 1 }).valueOf()
        },
        currentTimeRange: {
          start_date: DateTime.now().startOf('day').valueOf(),
          end_date: DateTime.now().endOf('day').valueOf()
        }
      }),
      hour_last_week: () => ({
        previousTimeRange: {
          start_date: DateTime.now().startOf('hour').minus({ week: 1 }).valueOf(),
          end_date: DateTime.now().endOf('hour').minus({ week: 1 }).valueOf()
        },
        currentTimeRange: {
          start_date: DateTime.now().startOf('hour').valueOf(),
          end_date: DateTime.now().endOf('hour').valueOf()
        }
      })
    }

    const rawMeasures = [
      'airport.trips.count',
      'airport.fees.count',
      'airport.passenger_wait.avg',
      'airport.dwell.avg',
      ...LiteralArray<MetricName>(AirportEventMeasureNames),
      ...LiteralArray<MetricName>(AirportVehicleStateMeasureNames)
    ] as Partial<MetricName>[]

    const { filters, filteredMeasures } = builderMetricQueryFilters({ filterState, measures: rawMeasures })

    return {
      key: 'report-chart-bar',
      query: {
        measures: filteredMeasures ?? rawMeasures,
        filters,
        interval: intervalMap[timeComparator](),
        ...timeRangesMap[timeComparator](),
        dimensions: ['transaction_type']
      },
      active: true,
      salt: 0,
      // Note: dimensionValues must include all the possible values for ONLY the dimensions specified in the query. TODO: Replace this with the actual query dimensions to enforce / avoid confusion.
      dimensionValues: {
        transaction_type: ['pick_up', 'drop_off', null]
      }
    }
  }, [filterState, timeComparator])

  const aggregates = [...previousAggregates, ...currentAggregates]

  if (loadState === LoadState.loading) {
    return <CenteredLoadingSpinner />
  }

  switch (graphType) {
    case 'pudo_vs_enter_exit':
      return <PudoTripsChart {...{ aggregates, dimensions, timeComparator }} />
    case 'total_trips':
      return (
        <SingleMetricVersusChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.trips.count',
            timeComparator
          }}
        />
      )
    case 'total_fees':
      return (
        <SingleMetricVersusChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.fees.count',
            timeComparator
          }}
        />
      )
    case 'average_connect_time':
      return (
        <SingleMetricVersusChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.passenger_connect_time.avg',
            timeComparator
          }}
        />
      )
    case 'average_dwell_time':
      return (
        <SingleMetricVersusChart
          {...{
            aggregates,
            dimensions,
            measureName: 'airport.dwell.avg',
            timeComparator
          }}
        />
      )
    case 'events_by_type':
      return <VehicleEventVersusChart {...{ aggregates, dimensions, timeComparator }} />
    case 'vehicle_state_by_type':
      return <VehicleStateVersusChart {...{ aggregates, dimensions, timeComparator }} />
    default:
      return <></>
  }
}

export const ReportChartSwitcher = ({
  chartType,
  selectedGraph,
  selectedTimeComparator,
  filterState
}: {
  chartType: CHART_TYPE
  selectedGraph: GRAPH_TYPE
  selectedTimeComparator: TIME_COMPARATOR_TYPE
  filterState: FilterState
}) => {
  if (chartType === 'line') {
    return (
      <ChartContainer>
        {dimensions => (
          <MultilineChart
            {...{
              graphType: selectedGraph,
              dimensions,
              filterState
            }}
          />
        )}
      </ChartContainer>
    )
  }
  if (chartType === 'table') {
    return (
      <MetricsTable
        {...{
          filterState
        }}
      />
    )
  }
  return (
    <ChartContainer>
      {dimensions => (
        <BarChart {...{ graphType: selectedGraph, dimensions, filterState, timeComparator: selectedTimeComparator }} />
      )}
    </ChartContainer>
  )
}
