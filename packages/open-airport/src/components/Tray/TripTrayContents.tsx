import React, { useState } from 'react'
import {
  Paper,
  List,
  Typography,
  Box,
  Card,
  createStyles,
  makeStyles,
  Button,
  Grid,
  ListItem,
  Chip
} from '@material-ui/core'
import { ListField, ServiceTypeIcon, TransactionTypeIcon } from 'components'
import { vehicleEventMap } from 'lib/events'
import { DateTime } from 'luxon'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { serviceTypeMap, transactionTypeMap, vehicleStateMap_v1_1 } from 'lib/trip'
import { TripEventsMapContainer } from 'components/Map'
import { faMap } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { flatten, upperFirst } from 'lodash'
import { ArrowBack, EmojiPeople, PhoneIphone } from '@material-ui/icons'
import {
  FlexCard,
  formatDuration,
  GeographyBadges,
  geographies as geoStore,
  VehicleEventType,
  getEventId
} from '@lacuna/ui-common'
import { TripDomainModel } from '@lacuna-core/mds-trip-backend'
import {
  TNC_VEHICLE_EVENT,
  TRIP_STATE,
  TRIP_STATES,
  VEHICLE_STATE,
  VEHICLE_STATES,
  VEHICLE_TYPE,
  VEHICLE_TYPES
} from '@mds-core/mds-types'
import { EventCardInfo } from './EventInfoCard'

const TIMESTAMP_FORMAT = 'LL-dd-yy hh:mm a'
const { providerMap } = AirportConsoleConfig
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default
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
      padding: '16px',
      alignItems: 'center'
    },
    cardActionButton: {
      color: theme.palette.action.active
    },
    centered: {
      textAlign: 'center'
    },
    typeIcon: {
      marginRight: '10px'
    },
    iconContainer: {
      display: 'flex'
    }
  })
)

const parseString = (val: unknown): string => {
  if (val && typeof val === 'string') {
    return val
  }
  if (val && typeof val !== 'string') {
    // eslint-disable-next-line no-console
    console.log('ERROR: unknown type, provider value is not a string')
  }
  return '-'
}

const parseNumber = (val: unknown | undefined): number => {
  if (val && typeof val === 'number') {
    return val
  }
  if (val && typeof val !== 'number') {
    // eslint-disable-next-line no-console
    console.log('ERROR: unknown type, provider value is not a number')
  }
  return 0
}

const isEnumConstType = <T,>(val: unknown, typeVals: readonly string[]): val is T => {
  if (typeof val === 'string' && typeVals.includes(val)) {
    return true
  }
  return false
}

const parseEnumConstType = <T extends string>(val: unknown, typeVals: readonly T[]): T | undefined => {
  if (isEnumConstType<T>(val, typeVals)) {
    return val
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/ban-types
const selectedTripEventToEvent = (eventObj: object): VehicleEventType => {
  // How to do this correctly? It's a json object so we know keys will be strings...
  const event = eventObj as Record<string, unknown>

  return {
    device_id: parseString(event.device_id),
    event_types: Array.isArray(event.event_types) ? event.event_types : [],
    provider_id: parseString(event.provider_id),
    recorded: parseNumber(event.event_recorded),
    telemetry_timestamp: parseNumber(event.telemetry_timestamp),
    timestamp: parseNumber(event.event_timestamp),
    trip_id: parseString(event.trip_id),
    trip_state: parseEnumConstType<TRIP_STATE>(event.trip_state, TRIP_STATES) || null,
    vehicle_state: parseEnumConstType<VEHICLE_STATE>(event.vehicle_state, VEHICLE_STATES) || 'unknown',
    annotation: {
      device_id: parseString(event.device_id),
      vehicle_id: parseString(event.vehicle_id),
      timestamp: parseNumber(event.event_timestamp),

      vehicle_type: parseEnumConstType<VEHICLE_TYPE>(event.vehicle_type, VEHICLE_TYPES) || 'other',
      propulsion_types: [],
      geography_ids:
        ((event.geographies &&
          Array.isArray(event.geographies) &&
          event.geographies.map<string>((geo: Record<string, string>) => parseString(geo.geography_id))) as string[]) ||
        [],
      geography_types:
        ((event.geographies &&
          Array.isArray(event.geographies) &&
          event.geographies.map<string>((geo: Record<string, string>) => geo.geography_type)) as string[]) || [],
      latency_ms: parseNumber(event.latency_ms),
      recorded: parseNumber(event.event_recorded)
    },
    telemetry: {
      device_id: parseString(event.device_id),
      provider_id: parseString(event.provider_id),
      stop_id: null,
      recorded: parseNumber(event.event_recorded),
      timestamp: parseNumber(event.telemetry_timestamp),
      charge: parseNumber(event.telemetry_gps_charge),
      gps: {
        lat: parseNumber(event.telemetry_gps_lat),
        lng: parseNumber(event.telemetry_gps_lng),
        speed: parseNumber(event.telemetry_gps_speed),
        heading: parseNumber(event.telemetry_gps_heading),
        accuracy: parseNumber(event.telemetry_gps_accuracy),
        altitude: parseNumber(event.telemetry_gps_altitude)
      }
    }
  }
}

export const TripTrayContents = ({
  selectedTrip,
  mapExpanded,
  onMapExpanded,
  onTripEventSelected
}: {
  selectedTrip: TripDomainModel
  mapExpanded: boolean
  onMapExpanded: () => void
  onTripEventSelected: (event?: VehicleEventType) => void
}) => {
  const classes = useStyles()
  const [selectedTripEvent, setSelectedTripEvent] = useState<VehicleEventType | undefined>()
  const [showEventDetails, setShowEventDetails] = useState(false)
  const selectedTripEvents = selectedTrip.trip_events_log.map(event => selectedTripEventToEvent(event))

  const geography_ids = flatten(selectedTripEvents.map(event => event.annotation?.geography_ids))
  const uniqueGeoIds: string[] = [...new Set(geography_ids)].filter((id): id is string => !!id)
  const geographies = geoStore.hooks.useGeographiesById(uniqueGeoIds)
  return (
    <>
      <Paper className={classes.root}>
        <FlexCard
          {...{
            title: `Trip ID: ${selectedTrip.trip_id}`,
            icon: <></>,
            style: { marginBottom: '8px' },
            centerTitle: true
          }}
        >
          <List component='nav' aria-label='selectedTrip' disablePadding>
            <ListField
              label={'Trip Start'}
              subLabel={`${DateTime.fromMillis(selectedTrip.min_event_timestamp).toFormat(TIMESTAMP_FORMAT)}`}
              autoWidth
            >
              <Box display='flex' flexDirection='column' alignItems='flex-end'>
                <Typography variant='body2'>Trip End</Typography>
                <Typography variant='subtitle2'>
                  {DateTime.fromMillis(selectedTrip.max_event_timestamp).toFormat(TIMESTAMP_FORMAT)}
                </Typography>
              </Box>
            </ListField>
            <ListField label={'Trip Status'} autoWidth>
              <Typography>{upperFirst(selectedTrip.trip_status)}</Typography>
            </ListField>

            <ListField label={'Provider'} autoWidth>
              <Typography>{providerMap[selectedTrip.provider_id].provider_name}</Typography>
            </ListField>
            <ListField label={'License Plate'} autoWidth>
              <Typography>{selectedTrip.vehicle_id}</Typography>
            </ListField>
            <ListField label={'Device ID'} autoWidth>
              <Typography variant='body2'>{selectedTrip.device_id}</Typography>
            </ListField>
            <ListField label={'Type'} autoWidth>
              <div className={classes.iconContainer}>
                <TransactionTypeIcon
                  {...{ transaction_type: selectedTrip.transaction_type }}
                  className={classes.typeIcon}
                />
                <Typography>{transactionTypeMap[selectedTrip.transaction_type].label}</Typography>
              </div>
            </ListField>
            <ListField label={'Service'} autoWidth>
              <div className={classes.iconContainer}>
                <ServiceTypeIcon {...{ service_type: selectedTrip.service_type }} className={classes.typeIcon} />
                <Typography>{serviceTypeMap[selectedTrip.service_type].label}</Typography>
              </div>
            </ListField>
            <Box style={{ textAlign: 'center' }}>
              {geographies && geographies.length > 0 && <GeographyBadges {...{ geographies }} />}
            </Box>
          </List>
        </FlexCard>
        <FlexCard {...{ title: `Reservation Info`, icon: <></>, style: { marginBottom: '8px' }, centerTitle: true }}>
          <>
            <ListItem>
              <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', width: '100%' }}>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 126 }}>
                  <Typography variant='subtitle2'>Method</Typography>
                  <PhoneIphone />
                  <Typography variant='body2'>App</Typography>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 126 }}>
                  <Typography variant='subtitle2'>Reservation Time</Typography>
                  <Typography variant='body2'>
                    {DateTime.fromMillis(
                      (selectedTrip.transaction_type === 'pick_up'
                        ? selectedTrip.pickup_event_timestamp
                        : selectedTrip.dropoff_event_timestamp) || NaN
                    ).toFormat(TIMESTAMP_FORMAT)}
                  </Typography>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 126 }}>
                  <Typography variant='subtitle2'>Type</Typography>
                  <EmojiPeople />
                  <Typography variant='body2'>On Demand</Typography>
                </Box>
              </Box>
            </ListItem>
            <ListItem>
              <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', width: '100%' }}>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 126 }}>
                  <Typography variant='subtitle2'>Dwell Time</Typography>
                  <Chip
                    label={selectedTrip.dwell_time ? formatDuration(selectedTrip.dwell_time * 100) : '-'}
                    variant='outlined'
                  />
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 126 }}>
                  <Typography variant='subtitle2'>Connect Time</Typography>
                  <Chip
                    label={
                      selectedTrip.passenger_wait_time ? formatDuration(selectedTrip.passenger_wait_time * 100) : '-'
                    }
                    variant='outlined'
                  />
                </Box>
              </Box>
            </ListItem>
          </>
        </FlexCard>
        <>
          <FlexCard
            {...{
              title: 'Trip Map',
              style: { display: mapExpanded ? 'none' : 'block', marginBottom: '8px' },
              centerTitle: true,
              icon: <></>,
              actions: (
                <Grid container style={{ justifyContent: 'center' }}>
                  <Grid item xs={6} className={classes.centered}>
                    <Button
                      className={classes.cardActionButton}
                      startIcon={<FontAwesomeIcon icon={faMap} size='lg' />}
                      size='small'
                      color='primary'
                      onClick={() => onMapExpanded()}
                    >
                      Expand Map
                    </Button>
                  </Grid>
                </Grid>
              )
            }}
          >
            <div style={{ width: '100%', height: 400 }}>
              <TripEventsMapContainer
                {...{
                  events: selectedTripEvents,
                  selectedTripEvent
                }}
              />
            </div>
          </FlexCard>
        </>
        {showEventDetails && selectedTripEvent && (
          <EventCardInfo
            {...{
              selectedEvent: selectedTripEvent,
              title: 'TRIP EVENTS',
              icon: (
                <Button
                  className={classes.cardActionButton}
                  size='small'
                  color='primary'
                  onClick={() => {
                    setShowEventDetails(false)
                    setSelectedTripEvent(undefined)
                    onTripEventSelected(undefined)
                  }}
                >
                  <ArrowBack />
                </Button>
              )
            }}
          />
        )}
        {selectedTripEvents.length > 0 && !showEventDetails && (
          <FlexCard {...{ title: 'Trip Events', icon: <></>, style: { marginBottom: 8 }, centerTitle: true }}>
            <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box {...{ className: classes.eventCard }}>
                <Box style={{ width: 124 }}>
                  <Typography variant='body1'>Time</Typography>
                </Box>
                <Box style={{ marginLeft: 8, width: 124 }}>
                  <Typography variant='body1'>Event Types</Typography>
                </Box>
                <Box style={{ width: 100 }}>
                  <Typography variant='body1'>Vehicle State</Typography>
                </Box>
              </Box>
              {selectedTripEvents.map(tripEvent => {
                const { timestamp, event_types, vehicle_state } = tripEvent
                return (
                  <Card
                    key={getEventId(tripEvent)}
                    {...{
                      className: classes.eventList,
                      onClick: () => {
                        setSelectedTripEvent(tripEvent)
                        onTripEventSelected(tripEvent)
                        setShowEventDetails(true)
                      }
                    }}
                  >
                    <Box {...{ className: classes.eventCard }}>
                      <Box style={{ width: 124 }}>
                        <Typography variant='body2'>
                          {DateTime.fromMillis(timestamp).toFormat(TIMESTAMP_FORMAT)}
                        </Typography>
                      </Box>
                      <Box style={{ marginLeft: 8, width: 124 }}>
                        <Typography variant='body2'>
                          {vehicleEventMap[event_types[0] as TNC_VEHICLE_EVENT].label}
                        </Typography>
                      </Box>
                      <Box style={{ width: 100 }}>
                        <Typography variant='body2'>{vehicleStateMap_v1_1[vehicle_state].label}</Typography>
                      </Box>
                    </Box>
                  </Card>
                )
              })}
            </Box>
          </FlexCard>
        )}
      </Paper>
    </>
  )
}
