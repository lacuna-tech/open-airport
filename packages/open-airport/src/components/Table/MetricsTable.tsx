import React from 'react'
import { CellParams, Columns, DataGrid, RowsProp } from '@material-ui/data-grid'
import {
  aggregateMetrics,
  getFormattedMetricValue,
  groupAndAggregateMetrics,
  groupMetricsByDimension,
  MetricAggregate,
  useMetrics,
  LiteralArray,
  MetricName,
  AirportEventMeasureNames,
  LoadState,
  CenteredLoadingSpinner
} from '@lacuna/ui-common'
import { uuid } from '@mds-core/mds-utils'
import { DateTime } from 'luxon'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { FilterState } from 'components/Filters/types'
import { builderMetricQueryFilters } from 'components/Filters/helper'

const { providerMap } = AirportConsoleConfig

const DATETIME_FORMAT = 'LL-dd-yy hh:mm a'

export const MetricsTable: React.FC<{
  filterState: FilterState
}> = ({ filterState }) => {
  const {
    result: { aggregates, loadState }
  } = useMetrics(() => {
    const { filters, start_date, end_date, interval } = builderMetricQueryFilters({ filterState })

    return {
      key: `report-table`,
      query: {
        measures: [
          'airport.trips.count',
          'airport.fees.count',
          'airport.passenger_connect_time.avg',
          'airport.dwell.avg',
          ...LiteralArray<MetricName>(AirportEventMeasureNames)
        ],
        filters,
        interval,
        start_date,
        end_date,
        dimensions: ['provider_id', 'transaction_type']
      },
      active: true,
      salt: 0,
      // Note: dimensionValues must include all the possible values for ONLY the dimensions specified in the query. TODO: Replace this with the actual query dimensions to enforce / avoid confusion.
      dimensionValues: {
        provider_id: Object.keys(providerMap),
        transaction_type: ['pick_up', 'drop_off', null]
      }
    }
  }, [filterState])

  if (loadState === LoadState.loading || aggregates.length === 0) {
    return <CenteredLoadingSpinner />
  }

  const rows: RowsProp = groupAndAggregateMetrics(aggregates, aggregate => [
    aggregate.time_bin_start,
    aggregate.dimensions?.provider_id
  ])
    .map((aggregate: MetricAggregate) => {
      const subAggregatesByTransactionType = groupMetricsByDimension({
        aggregates: aggregate.aggregates,
        dimension: 'transaction_type'
      })
      return {
        id: uuid(),
        time_bin_start: DateTime.fromMillis(aggregate.time_bin_start).toFormat(DATETIME_FORMAT),
        provider: aggregate.dimensions?.provider_id,
        aggregate,
        pickUpSubAggregate:
          subAggregatesByTransactionType.pickup && subAggregatesByTransactionType.pick_up.length > 0
            ? aggregateMetrics({
                aggregates: subAggregatesByTransactionType.pick_up
              })
            : [],
        dropOffSubAggregate:
          subAggregatesByTransactionType.drop_off && subAggregatesByTransactionType.drop_off.length > 0
            ? aggregateMetrics({
                aggregates: subAggregatesByTransactionType.drop_off
              })
            : [],
        pick_ups:
          subAggregatesByTransactionType.pick_up && subAggregatesByTransactionType.pick_up.length > 0
            ? aggregateMetrics({
                aggregates: subAggregatesByTransactionType.pick_up
              }).measures['airport.trips.count']
            : 0,
        drop_offs:
          subAggregatesByTransactionType.drop_off && subAggregatesByTransactionType.drop_off.length > 0
            ? aggregateMetrics({
                aggregates: subAggregatesByTransactionType.drop_off
              }).measures['airport.trips.count']
            : 0,
        fees: getFormattedMetricValue({ name: 'airport.fees.count', aggregate }),
        enter_jurisdiction: getFormattedMetricValue({ name: 'airport.event.enter_jurisdiction.count', aggregate }),
        leave_jurisdiction: getFormattedMetricValue({ name: 'airport.event.leave_jurisdiction.count', aggregate }),
        average_connect_time: getFormattedMetricValue({ name: 'airport.passenger_connect_time.avg', aggregate }),
        average_dwell_time: getFormattedMetricValue({ name: 'airport.dwell.avg', aggregate })
      }
    })
    .flat()

  const columns: Columns = [
    {
      field: 'time_bin_start',
      headerName: 'Time Bin',
      width: 180
    },
    {
      field: 'provider',
      headerName: 'Provider',
      valueFormatter: (params: CellParams) => providerMap[params.value as string].provider_name,
      width: 140
    },
    {
      field: 'fees',
      headerName: 'Fees'
    },
    {
      field: 'pick_ups',
      headerName: 'Pick-Ups'
    },
    {
      field: 'drop_offs',
      headerName: 'Drop-Offs'
    },
    {
      field: 'enter_jurisdiction',
      headerName: 'Enter Jurisdiction',
      width: 150
    },
    {
      field: 'leave_jurisdiction',
      headerName: 'Leave Jurisdiction',
      width: 150
    },
    {
      field: 'average_connect_time',
      headerName: 'Average Connect Time',
      width: 180
    },
    {
      field: 'average_dwell_time',
      headerName: 'Average Dwell Time',
      width: 160
    }
  ]
  return (
    <DataGrid
      {...{
        rows,
        columns,
        pageSize: 10,
        rowsPerPageOptions: [10, 25, 50]
      }}
    />
  )
}
