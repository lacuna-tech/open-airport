import React from 'react'
import { makeStyles, createStyles, Paper } from '@material-ui/core'
import { useAirports, useAirport } from 'hooks'
import { VehicleEventType } from '@lacuna/ui-common'
import { MapContainer } from '../MapContainer'
import { TripEventsMap } from '../TripEventsMap'

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

export const TripEventsMapContainer = ({
  selectedTripEvent,
  events
}: {
  selectedTripEvent?: VehicleEventType
  events: VehicleEventType[] // if provided, don't generate fake events
}) => {
  const classes = useStyles()
  const airports = useAirports()
  const { airport } = useAirport({ airports })
  return (
    <Paper className={classes.root}>
      <MapContainer {...{ dependenciesLoading: false }}>
        {(onMapLoaded, dimensions) => (
          <TripEventsMap
            {...{
              airport,
              dimensions,
              onMapLoaded,
              events,
              selectedEvent: selectedTripEvent
            }}
          />
        )}
      </MapContainer>
    </Paper>
  )
}
