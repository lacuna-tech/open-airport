import React from 'react'
import { vehicleEventMap } from 'lib/events'
import { Box, Button, Card, createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import { DateTime } from 'luxon'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { EventTrayMapContainer } from 'components/Map'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap } from '@fortawesome/pro-solid-svg-icons'
import { FlexCard, getEventId, VehicleEventType } from '@lacuna/ui-common'
import { UUID, TNC_VEHICLE_EVENT } from '@mds-core/mds-types'
import { useDispatch } from 'react-redux'
import { setSelectedEvent } from 'store/tray'
import { EventCardInfo } from './EventInfoCard'

const TIMESTAMP_FORMAT = 'LL-dd-yy hh:mm a'
const { providerMap } = AirportConsoleConfig
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default
    },
    cardActionButton: {
      color: theme.palette.action.active
    },
    centered: {
      textAlign: 'center'
    },
    eventList: {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        opacity: 0.8
      },
      borderRadius: 0
    },
    eventCard: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px'
    }
  })
)

export const EventTrayContents = ({
  selectedEvent,
  mapExpanded,
  relatedEvents,
  showMiniMap,
  onMapExpanded
}: {
  selectedEvent: VehicleEventType
  mapExpanded?: boolean
  relatedEvents?: VehicleEventType[]
  showMiniMap?: boolean
  onMapExpanded?: () => void
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const onEventSelected = (eventId: UUID) => {
    dispatch(
      setSelectedEvent({
        id: eventId,
        relatedEventIds: relatedEvents ? relatedEvents.map(e => getEventId(e)) : []
      })
    )
  }
  const selectedEventId = getEventId(selectedEvent)

  const filteredEvents =
    (relatedEvents && relatedEvents.filter(event => getEventId(event) !== selectedEventId)) || undefined

  return (
    <Paper className={classes.root}>
      <EventCardInfo {...{ selectedEvent, title: 'Event Details', icon: <></> }} />
      {filteredEvents && (
        <FlexCard
          {...{
            title: 'Nearby Events',
            icon: <></>
          }}
        >
          <Box>
            {filteredEvents.map(event => (
              <Card
                key={getEventId(event)}
                {...{
                  className: classes.eventList,
                  onClick: () => onEventSelected(getEventId(event))
                }}
              >
                <Box {...{ className: classes.eventCard }}>
                  <Typography variant='body2'>
                    {DateTime.fromMillis(event.timestamp).toFormat(TIMESTAMP_FORMAT)}
                  </Typography>
                  <Typography variant='body2'>{event.annotation?.vehicle_id}</Typography>

                  <Typography variant='body2'>
                    {vehicleEventMap[selectedEvent.event_types[0] as TNC_VEHICLE_EVENT].label}
                  </Typography>
                  <Typography variant='body2'>{providerMap[event.provider_id].provider_name}</Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </FlexCard>
      )}
      {showMiniMap && (
        <FlexCard
          {...{
            title: 'Event Map',
            icon: <></>,
            style: { display: mapExpanded ? 'none' : 'block', marginBottom: 8 },
            actions: (
              <Grid container style={{ justifyContent: 'center' }}>
                <Grid item xs={6} className={classes.centered}>
                  <Button
                    className={classes.cardActionButton}
                    startIcon={<FontAwesomeIcon icon={faMap} size='lg' />}
                    size='small'
                    color='primary'
                    onClick={() => onMapExpanded && onMapExpanded()}
                  >
                    Expand Map
                  </Button>
                </Grid>
              </Grid>
            )
          }}
        >
          <Box style={{ width: '100%', height: 400 }}>
            <EventTrayMapContainer
              {...{
                selectedEvent,
                filters: {},
                useLiveData: false,
                onRelatedEventsSelected: () => null
              }}
            />
          </Box>
        </FlexCard>
      )}
    </Paper>
  )
}
