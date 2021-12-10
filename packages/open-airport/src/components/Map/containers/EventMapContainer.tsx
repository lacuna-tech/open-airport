import React, { useEffect } from 'react'
import { makeStyles, createStyles, Paper } from '@material-ui/core'
import { useAirports, useAirport, useGeographiesWithMetadata } from 'hooks'
import { FilterState, filterStateToFilterParams } from 'components/Filters'
import { GetVehicleEventsFilterParams, LoadState, useVehicleEvents } from '@lacuna/ui-common'
import { DateTime } from 'luxon'
import { MapContainer } from '../MapContainer'
import { EventMap } from '../EventMap'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      height: '100%',
      width: '100%'
    },
    filterContainer: {
      '& > *': { marginTop: theme.spacing(1) }
    }
  })
)

export const EventMapContainer = ({
  filters,
  useLiveData,
  onDataRefreshed,
  disableMapClick
}: {
  filters: FilterState
  useLiveData: boolean
  onDataRefreshed?: (time: DateTime) => void
  disableMapClick?: boolean
}) => {
  const classes = useStyles()
  const airports = useAirports()
  const { airport } = useAirport({ airports })
  const allGeographies = useGeographiesWithMetadata()
  const allGeographyIds = React.useMemo(() => allGeographies.map(geo => geo.geography_id), [allGeographies])

  const requestParams: GetVehicleEventsFilterParams = React.useMemo(() => filterStateToFilterParams(filters), [filters])
  const { events, fetchEventsLive, loadState, silent } = useVehicleEvents(requestParams, allGeographyIds)

  // "live" mode
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (useLiveData) {
      interval = setInterval(() => {
        fetchEventsLive()
      }, 15000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => interval && clearInterval(interval)
  }, [useLiveData, fetchEventsLive])

  const dependenciesLoading = !silent && loadState === LoadState.loading

  return (
    <Paper className={classes.root}>
      <MapContainer {...{ dependenciesLoading }}>
        {(onMapLoaded, dimensions) => (
          <EventMap
            {...{
              airport,
              dimensions,
              disableMapClick,
              onMapLoaded,
              useLiveData,
              onDataRefreshed,
              events
            }}
          />
        )}
      </MapContainer>
    </Paper>
  )
}
