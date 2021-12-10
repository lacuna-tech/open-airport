import React from 'react'
import { makeStyles, createStyles, Paper } from '@material-ui/core'
import { useAirports, useAirport } from 'hooks'
import { VehicleEventType } from '@lacuna/ui-common'
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

export const EventTrayMapContainer = ({
  selectedEvent,
  useLiveData,
  onDataRefreshed
}: {
  selectedEvent: VehicleEventType
  useLiveData: boolean
  onDataRefreshed?: (time: DateTime) => void
}) => {
  const classes = useStyles()
  const airports = useAirports()
  const { airport } = useAirport({ airports })

  return (
    <Paper className={classes.root}>
      <MapContainer {...{ dependenciesLoading: false }}>
        {(onMapLoaded, dimensions) => (
          <EventMap
            {...{
              airport,
              dimensions,
              disableMapClick: true,
              onMapLoaded,
              useLiveData,
              onDataRefreshed,
              events: [selectedEvent]
            }}
          />
        )}
      </MapContainer>
    </Paper>
  )
}
