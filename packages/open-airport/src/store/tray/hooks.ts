import { TripDomainModel } from '@lacuna-core/mds-trip-backend'
import { VehicleEventType, useVehicleEvents, getEventId } from '@lacuna/ui-common'
import { useSelector } from 'react-redux'
import { selectors } from 'store/trips'

import { selectEventTrayState, selectTripTrayState } from './selectors'

export const useEventTray = () => {
  const { eventId, relatedEventIds } = useSelector(selectEventTrayState)
  const { events } = useVehicleEvents()

  if (!events) return
  const selectedEvent = eventId && (events.find(e => getEventId(e) === eventId) as VehicleEventType)
  if (!selectedEvent) return undefined
  const relatedEvents = (relatedEventIds
    ? events?.filter(e => relatedEventIds.includes(getEventId(e)))
    : []) as VehicleEventType[]

  return { selectedEvent, relatedEvents }
}

export const useTripTray = () => {
  const { tripId } = useSelector(selectTripTrayState)

  const {
    data: { trips }
  } = useSelector(selectors.selectTripsState)
  const selectedTrip = tripId && (trips.find(t => t.trip_id === tripId) as TripDomainModel)
  if (!selectedTrip) return undefined

  return { selectedTrip }
}
