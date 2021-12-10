import React, { useEffect, useState, ElementType } from 'react'
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
import { vehicleEventMap } from 'lib/events'
import { UUID, TNC_VEHICLE_EVENT, TNC_VEHICLE_STATE } from '@mds-core/mds-types'
import { vehicleStateMap_v1_1 } from 'lib/trip'
import { DateTime } from 'luxon'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { FilterState, filterStateToFilterParams } from 'components/Filters'
import { LoadState, VehicleEventType, useVehicleEvents, getEventId } from '@lacuna/ui-common'
import { useDispatch } from 'react-redux'
import { setSelectedEvent } from 'store/tray'
import { usePrevious } from 'react-use'
import { GetVehicleEventsOrderColumn, GetVehicleEventsOrderDirection } from '@mds-core/mds-ingest-service'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { CustomPagination } from './CustomPagination'
import { useGeographiesWithMetadata } from '../../hooks'

const EVENTS_TABLE_LIMIT = 10

const { providerMap } = AirportConsoleConfig

const useStyles = makeStyles(
  createStyles({
    gridContainer: {
      height: 700,
      padding: '20px'
    },
    gridPaper: {
      height: '100%',
      padding: '10px'
    }
  })
)

interface EventRow extends Partial<VehicleEventType> {
  id: UUID
  lat?: number
  lng?: number
}

const columns: Columns = [
  {
    field: 'timestamp',
    headerName: 'Event Timestamp',
    width: 180,
    valueFormatter: (params: CellParams) => DateTime.fromMillis(params.value as number).toFormat('LL/dd/yy hh:mm:ss a')
  },
  {
    field: 'vehicle_id',
    headerName: 'License Plate',
    width: 140,
    sortable: false
  },
  {
    field: 'provider_id',
    headerName: 'Provider',
    width: 140,
    valueFormatter: (params: CellParams) => providerMap[params.value as string].provider_name
  },
  {
    field: 'event_types',
    headerName: 'Event Types',
    width: 180,
    valueFormatter: (params: CellParams) => vehicleEventMap[params.value as TNC_VEHICLE_EVENT]?.label,
    sortable: false
  },
  {
    field: 'vehicle_state',
    headerName: 'Vehicle State',
    width: 180,
    valueFormatter: (params: CellParams) => vehicleStateMap_v1_1[params.value as TNC_VEHICLE_STATE].label
  },
  {
    field: 'lat',
    headerName: 'Lat',
    width: 180,
    valueFormatter: (params: CellParams) => {
      const value = params.value as number
      return value?.toFixed(5)
    },
    sortable: false
  },
  {
    field: 'lng',
    headerName: 'Lon',
    width: 180,
    valueFormatter: (params: CellParams) => {
      const value = params.value as number
      return value?.toFixed(5)
    },
    sortable: false
  }
]

export const EventsTable = ({ filters }: { filters: FilterState }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [paginationLink, setPaginationLink] = useState<string | null>(null)
  const [sortModel, setSortModel] = useState<SortModel>([{ field: 'timestamp', sort: 'desc' }])

  const allGeographies = useGeographiesWithMetadata()
  const allGeographyIds = React.useMemo(() => allGeographies.map(geo => geo.geography_id), [allGeographies])

  const order = React.useMemo(
    () =>
      sortModel[0]
        ? {
            column: sortModel[0].field as GetVehicleEventsOrderColumn,
            direction: sortModel[0].sort?.toUpperCase() as GetVehicleEventsOrderDirection
          }
        : undefined,
    [sortModel]
  )

  const requestParams = React.useMemo(() => filterStateToFilterParams(filters, order, EVENTS_TABLE_LIMIT), [
    filters,
    order
  ])
  const { events, loadState, cursor } = useVehicleEvents(requestParams, allGeographyIds, paginationLink)

  const previousSortModel = usePrevious(sortModel)
  const previousFilters = usePrevious(filters)

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

  const onBackBtnClicked = () => {
    setPaginationLink(cursor.prev)
  }

  const onNextBtnClicked = () => {
    setPaginationLink(cursor.next)
  }

  const pagination: ElementType<ComponentProps> = () =>
    CustomPagination({ cursor: cursor ?? { prev: null, next: null }, onBackBtnClicked, onNextBtnClicked })

  const rows: EventRow[] = events
    ? events.map(event => ({
        ...event,
        id: getEventId(event),
        lat: event.telemetry?.gps.lat,
        lng: event.telemetry?.gps.lng
      }))
    : ([] as EventRow[])

  const onRowSelected = (params: RowSelectedParams) => {
    dispatch(setSelectedEvent({ id: params.data.id.toString(), relatedEventIds: [] }))
  }

  const onSortModelChange = (params: SortModelParams) => {
    setSortModel(params.sortModel)
  }

  const sortingMode = 'server'
  const loading = loadState === LoadState.loading
  const components = { pagination }

  return (
    <Grid className={classes.gridContainer}>
      <Paper className={classes.gridPaper}>
        <DataGrid
          {...{
            columns,
            components,
            loading,
            onRowSelected,
            onSortModelChange,
            pageSize: EVENTS_TABLE_LIMIT,
            rows,
            sortModel,
            sortingMode
          }}
        />
      </Paper>
    </Grid>
  )
}
