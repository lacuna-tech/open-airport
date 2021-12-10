import React, { ElementType, useState, useEffect } from 'react'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { Grid, Paper } from '@material-ui/core'
import {
  CellParams,
  Columns,
  ComponentProps,
  DataGrid,
  RowSelectedParams,
  SortModel,
  SortModelParams
} from '@material-ui/data-grid'
import { UUID } from '@mds-core/mds-types'
import { FilterState, getTimeRangeOrDefault } from 'components/Filters'
import { serviceTypeMap, SERVICE_TYPE, transactionTypeMap, TRANSACTION_TYPE } from 'lib/trip'
import { upperFirst } from 'lodash'
import { DateTime } from 'luxon'
import { VehicleEventType, LoadState } from '@lacuna/ui-common'
import { GetTripsOptions, GetTripsOrderColumn, GetTripsOrderDirection } from '@lacuna-core/mds-trip-backend'
import { useTrips } from 'store/trips/hooks'

import { trayActions } from 'store/tray'
import { useDispatch } from 'react-redux'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { CustomPagination } from 'components'
import { usePrevious } from 'react-use'

const useStyles = makeStyles(theme =>
  createStyles({
    gridContainer: {
      height: 700,
      padding: theme.spacing(3)
    },
    gridPaper: {
      height: '100%',
      padding: theme.spacing(1)
    }
  })
)

const { providerMap } = AirportConsoleConfig
interface TripRow extends Partial<VehicleEventType> {
  id: UUID
  duration: number
}

const buildQueryParams = (filters: FilterState, sortOrder: SortModel) => {
  const params: GetTripsOptions = {}
  const keys = Object.keys(filters) as (keyof FilterState)[]
  const { time_range } = filters
  const { start, end } = getTimeRangeOrDefault(time_range)
  keys.map(key => {
    switch (key) {
      case 'provider_id':
        if ((filters.provider_id as UUID[])?.length > 0) {
          params.provider_id = filters.provider_id
        }
        break
      case 'geography_id':
        params.geography_ids = filters.geography_id ? [...filters.geography_id] : undefined
        break
      case 'vehicle_id':
        params.vehicle_id = filters.vehicle_id ? [filters.vehicle_id] : undefined

        break
      case 'service_type':
        params.service_type = filters.service_type
        break
      case 'transaction_type':
        params.transaction_type = filters.transaction_type
        break
      case 'time_range':
        params.time_range = {
          start,
          end
        }
        break
      default:
        break
    }
  })
  if (sortOrder && sortOrder.length > 0) {
    // SortModel can contain multiple order items, but we only allow one sorted column/direction pair at a time.
    const orderItem = sortOrder[0]
    params.order = {
      column: orderItem.field as GetTripsOrderColumn,
      direction: orderItem.sort?.toUpperCase() as GetTripsOrderDirection
    }
  }

  return params
}

const columns: Columns = [
  {
    field: 'min_event_timestamp',
    headerName: 'Start Time',
    width: 180,
    valueFormatter: (params: CellParams) => DateTime.fromMillis(params.value as number).toFormat('LL/dd/yy hh:mm:ss a')
  },
  {
    field: 'max_event_timestamp',
    headerName: 'End Time',
    width: 180,
    valueFormatter: (params: CellParams) => DateTime.fromMillis(params.value as number).toFormat('LL/dd/yy hh:mm:ss a')
  },
  {
    field: 'vehicle_id',
    headerName: 'License Plate',
    width: 140
  },
  {
    field: 'provider_id',
    headerName: 'Provider',
    width: 140,
    valueFormatter: (params: CellParams) => providerMap[params.value as string].provider_name
  },
  {
    field: 'trip_status',
    headerName: 'Trip Status',
    width: 180,
    sortable: false,
    valueFormatter: (params: CellParams) => params.value && upperFirst(params.value as string)
  },
  {
    field: 'transaction_type',
    headerName: 'Transaction Type',
    width: 180,
    valueFormatter: (params: CellParams) => transactionTypeMap[params.value as TRANSACTION_TYPE].label
  },
  {
    field: 'service_type',
    headerName: 'Service Type',
    width: 180,
    valueFormatter: (params: CellParams) => serviceTypeMap[params.value as SERVICE_TYPE].label
  }
]

export const TripsTable = ({ filters }: { filters: FilterState }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [paginationLink, setPaginationLink] = useState<string | null>(null)
  const [sortModel, setSortModel] = useState<SortModel>([{ field: 'min_event_timestamp', sort: 'desc' }])

  const queryParams = React.useMemo(() => buildQueryParams(filters, sortModel), [filters, sortModel])
  const { trips, links, loadState } = useTrips(() => ({ params: queryParams, link: paginationLink }), [queryParams])

  const rows: TripRow[] = trips.map(
    (trip): TripRow => ({
      ...trip,
      id: trip!.trip_id,
      duration: DateTime.fromMillis(trip.min_event_timestamp)
        .diff(DateTime.fromMillis(trip.max_event_timestamp))
        .toMillis()
    })
  )

  const loading = loadState === LoadState.loading
  const pageSize = 10
  const sortingMode = 'server'

  const previousSortModel = usePrevious(sortModel)
  const previousFilters = usePrevious(filters)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // When filters change, reset paginationLink back to default
    // Only execute fetch after pagination link is changed (if applicable)
    if (
      (previousFilters !== filters && paginationLink !== null) ||
      (sortModel !== previousSortModel && paginationLink !== null)
    ) {
      setPaginationLink(null)
    }
  }, [filters, sortModel, paginationLink, previousSortModel, previousFilters])

  const pagination: ElementType<ComponentProps> = () =>
    CustomPagination({ cursor: links, onBackBtnClicked, onNextBtnClicked })

  const onBackBtnClicked = () => {
    setPaginationLink(links.prev)
  }

  const onNextBtnClicked = () => {
    setPaginationLink(links.next)
  }

  const onRowSelected = (params: RowSelectedParams) => {
    const selectedTrip = trips.find(trip => trip!.trip_id === params.data.id)
    if (selectedTrip) {
      dispatch(trayActions.setSelectedTrip({ id: selectedTrip.trip_id }))
    }
  }

  const onSortModelChange = (params: SortModelParams) => {
    setSortModel(params.sortModel)
  }

  return (
    <Grid className={classes.gridContainer}>
      <Paper className={classes.gridPaper}>
        <DataGrid
          {...{
            columns,
            loading,
            pageSize,
            rows,
            sortModel,
            sortingMode,
            onRowSelected,
            onSortModelChange,
            components: { pagination }
          }}
        />
      </Paper>
    </Grid>
  )
}
