import { getEventId, VehicleEventType } from '@lacuna/ui-common'
import { makeStyles, createStyles } from '@material-ui/core'
import { UUID } from '@mds-core/mds-types'
import { EventCoin } from 'components'
import { LngLat, LngLatLike } from 'mapbox-gl'
import React, { useMemo } from 'react'
import { Marker } from 'react-map-gl'

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    markerTop: {
      zIndex: 999
    }
  })
)

export const EventMarker = ({
  event,
  isSelected,
  mainGate,
  onClick
}: {
  event: VehicleEventType
  isSelected: boolean
  mainGate: LngLatLike
  onClick: (event_id: UUID) => void
}) => {
  const classes = useStyles()
  return useMemo(() => {
    const { telemetry } = event
    const id = getEventId(event)

    const { lng: mainGateLng, lat: mainGateLat } = LngLat.convert(mainGate)
    const { lat, lng } = telemetry ? telemetry.gps : { lng: mainGateLng, lat: mainGateLat }

    const handleClick = () => {
      onClick(id)
    }

    // const size = (2 ** zoom / 10000) * 2 // Scaling the marker size by zoom, for a fixed size effect
    const size = isSelected ? 30 : 20

    return (
      <Marker
        {...{ offsetLeft: -size / 2, offsetTop: -size / 2 }}
        longitude={lng!}
        latitude={lat!}
        className={isSelected ? classes.markerTop : undefined}
      >
        <EventCoin {...{ onClick: handleClick, event, size, borderColor: '#fff' }} />
      </Marker>
    )
  }, [classes.markerTop, event, isSelected, onClick, mainGate])
}
