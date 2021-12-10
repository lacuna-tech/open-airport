import React from 'react'
import { List, Typography, Divider, Box } from '@material-ui/core'
import { ListField } from 'components'
import { vehicleEventMap } from 'lib/events'
import { DateTime } from 'luxon'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { FlexCard, GeographyBadges, geographies as geoStore, VehicleEventType } from '@lacuna/ui-common'
import { tripStateMap, vehicleStateMap_v1_1 } from 'lib'
import { TNC_VEHICLE_EVENT, UUID } from '@mds-core/mds-types'

const TIMESTAMP_FORMAT = 'LL-dd-yy hh:mm a'

const { providerMap } = AirportConsoleConfig

export const EventCardInfo = ({
  selectedEvent,
  title,
  icon
}: {
  selectedEvent: VehicleEventType
  title: string
  icon: JSX.Element
}) => {
  const geography_ids = selectedEvent.annotation?.geography_ids || []
  const uniqueIds = [...new Set(geography_ids as UUID[])]
  const geographies = geoStore.hooks.useGeographiesById(uniqueIds)

  return (
    <FlexCard
      {...{
        title,
        icon,
        centerTitle: true,
        style: { marginBottom: '8px' }
      }}
    >
      <List component='nav' aria-label='selectedEvent' disablePadding>
        <ListField
          label={'Event Timestamp'}
          subLabel={DateTime.fromMillis(selectedEvent.timestamp).toFormat(TIMESTAMP_FORMAT)}
          autoWidth
        >
          <Box display='flex' flexDirection='column' alignItems='flex-end'>
            <Typography variant='body2'>Event Recorded</Typography>
            <Typography variant='subtitle2'>
              {DateTime.fromMillis(selectedEvent.recorded).toFormat(TIMESTAMP_FORMAT)}
            </Typography>
          </Box>
        </ListField>
        <ListField label={'Event Type'} autoWidth>
          <Typography>{vehicleEventMap[selectedEvent.event_types[0] as TNC_VEHICLE_EVENT].label}</Typography>
        </ListField>

        <ListField label={'Provider'} autoWidth>
          <Typography>{providerMap[selectedEvent.provider_id].provider_name}</Typography>
        </ListField>
        <ListField label={'License Plate'} autoWidth>
          <Typography>{selectedEvent.annotation?.vehicle_id || '-'}</Typography>
        </ListField>

        <ListField label={'Vehicle State'} autoWidth>
          <Typography>{vehicleStateMap_v1_1[selectedEvent.vehicle_state].label || '-'}</Typography>
        </ListField>
        {selectedEvent.trip_state && (
          <ListField label={'Trip State'} autoWidth>
            <Typography>{tripStateMap[selectedEvent.trip_state].label}</Typography>
          </ListField>
        )}

        <ListField label={'Lat'} autoWidth>
          <Typography>{selectedEvent.telemetry?.gps.lat.toFixed(5)}</Typography>
        </ListField>
        <ListField label={'Lon'} autoWidth>
          <Typography>{selectedEvent.telemetry?.gps.lng.toFixed(5)}</Typography>
        </ListField>
        <ListField label={'Device ID'} autoWidth>
          <Typography variant='subtitle2'>{selectedEvent.device_id}</Typography>
        </ListField>
        <Box style={{ textAlign: 'center', width: '100%' }}>
          {selectedEvent.annotation && selectedEvent.annotation.geography_ids.length > 0 && (
            <GeographyBadges {...{ geographies }} />
          )}
        </Box>
        <Divider />
      </List>
    </FlexCard>
  )
}
