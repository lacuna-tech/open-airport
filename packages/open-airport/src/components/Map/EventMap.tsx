import React from 'react'
import { AirportDefinition } from '@lacuna/agency-config'
import { Dimensions } from 'components'
import MapGL, { Marker, PointerEvent } from 'react-map-gl'
import { LngLatLike, LngLat } from 'mapbox-gl'
import { usePrevious } from 'react-use'
import { EventCoin } from 'components/Coins'
import { getEventId, VehicleEventType } from '@lacuna/ui-common'
import { DateTime } from 'luxon'
import { setSelectedEvent, useEventTray } from 'store/tray'
import { useDispatch } from 'react-redux'
import { UUID } from '@mds-core/mds-types'
import { AirportGeometrySource, EventSource } from './sources'
import { useMap, useCinematicMap } from './hooks'
import { FlyToTransition } from './transition-effects'
import { getDistance } from './helpers'

const getEventBounds = ({ event, mainGate }: { event: VehicleEventType; mainGate: LngLatLike }): [number, number] => {
  const { lng: mainGateLng, lat: mainGateLat } = LngLat.convert(mainGate)
  const [lng, lat] = [event.telemetry?.gps?.lng || mainGateLng, event.telemetry?.gps?.lat || mainGateLat]
  return [lng, lat]
}

const sortFeaturesByLngLat = ({
  lngLat,
  features
}: {
  lngLat: [number, number]
  features: { properties: { id: UUID; lat: number; lng: number } }[]
}) => {
  return features.sort((a, b) => {
    const distancePrev = getDistance(
      { latitude: a.properties.lat, longitude: a.properties.lng },
      { latitude: lngLat[1], longitude: lngLat[0] }
    )
    const distanceNext = getDistance(
      { latitude: b.properties.lat, longitude: b.properties.lng },
      { latitude: lngLat[1], longitude: lngLat[0] }
    )
    return distancePrev - distanceNext
  })
}

export const EventMap = ({
  airport,
  dimensions,
  disableMapClick,
  onMapLoaded,
  events
}: {
  airport: AirportDefinition
  dimensions: Dimensions
  disableMapClick?: boolean
  useLiveData: boolean
  onMapLoaded: () => void
  events: VehicleEventType[]
  onDataRefreshed?: (time: DateTime) => void
}) => {
  const dispatch = useDispatch()
  const { bounds: airportBounds, mainGate } = airport
  const {
    mapProps,
    mapViewport,
    setMapViewport,
    mapViewport: { zoom }
  } = useMap({ airport, dimensions })

  const { selectedEvent } = useEventTray() || {}
  const { transition } = useCinematicMap({ zoom, mapViewport, setMapViewport })
  const previousSelectedEvent = usePrevious(selectedEvent)
  const selectedEventId = selectedEvent ? getEventId(selectedEvent) : undefined
  const previousSelectedEventId = previousSelectedEvent ? getEventId(previousSelectedEvent) : undefined

  const [defaultZoom, setDefaultZoom] = React.useState(mapProps.zoom)

  React.useEffect(() => {
    if (previousSelectedEventId !== selectedEventId) {
      if (selectedEvent) {
        // Fly to selected event
        transition({
          padding: [150, 150, 150, 150],
          lngLat: getEventBounds({ event: selectedEvent, mainGate }),
          transitionEffect: FlyToTransition
        })
      } else {
        // Reset to airport bounds
        transition({
          padding: 0,
          bounds: airportBounds,
          transitionEffect: FlyToTransition
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, airportBounds, mainGate, transition])

  const onMapClick = (event: PointerEvent) => {
    if (disableMapClick) {
      return
    }
    // Sort additional features by closest to click event
    const sortedFeatures = sortFeaturesByLngLat({ lngLat: event.lngLat, features: event.features })
    const eventIds = sortedFeatures.map(feature => {
      const {
        properties: { id }
      } = feature
      return id
    })

    // only take first 10 events if more are in selection
    const pickedEventIds = eventIds.slice(0, 9)
    dispatch(setSelectedEvent({ id: eventIds[0], relatedEventIds: pickedEventIds }))
  }

  // Set default zoom as calculated by default bounds
  React.useEffect(() => {
    setDefaultZoom(mapProps.zoom)
  }, [mapProps.zoom])

  return (
    <MapGL
      {...{
        ...mapProps,
        onLoad: onMapLoaded,
        clickRadius: 5,
        onClick: onMapClick,
        interactiveLayerIds: ['events']
      }}
    >
      <AirportGeometrySource {...{ airport, currentZoom: mapProps.zoom, defaultZoom }} />
      {selectedEvent && (
        <Marker
          {...{
            offsetLeft: -8,
            offsetTop: -8,
            longitude: getEventBounds({ event: selectedEvent, mainGate })[0],
            latitude: getEventBounds({ event: selectedEvent, mainGate })[1]
          }}
        >
          <EventCoin {...{ event: selectedEvent }} />
        </Marker>
      )}
      <EventSource {...{ events }} />
    </MapGL>
  )
}
