import React from 'react'
import { LngLatLike } from 'mapbox-gl'
import { UUID } from '@mds-core/mds-types'
import { getEventId, VehicleEventType } from '@lacuna/ui-common'
import { EventMarker } from './EventMarker'

export const EventMarkers = ({
  events,
  mainGate,
  onClick,
  selectedEventId
}: {
  events: VehicleEventType[]
  mainGate: LngLatLike
  selectedEventId?: UUID
  onClick: (event_id: UUID) => void
}) => {
  return (
    <>
      {events.map(event => {
        const id = getEventId(event)
        return <EventMarker key={`${id}`} {...{ event, isSelected: selectedEventId === id, mainGate, onClick }} />
      })}
    </>
  )
}
