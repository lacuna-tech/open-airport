import * as React from 'react'
import { AirportDefinition } from '@lacuna/agency-config'
import { Dimensions } from 'components'
import MapGL from 'react-map-gl'
import { LngLatLike, LngLat } from 'mapbox-gl'
import { usePrevious } from 'react-use'

import { getEventId, VehicleEventType } from '@lacuna/ui-common'
import { AirportGeometrySource } from './sources'
import { useMap, useCinematicMap } from './hooks'
import { FlyToTransition } from './transition-effects'
import { EventMarkers } from './markers'

const getEventBounds = ({ event, mainGate }: { event: VehicleEventType; mainGate: LngLatLike }): [number, number] => {
  const { lng: mainGateLng, lat: mainGateLat } = LngLat.convert(mainGate)
  const [lng, lat] = [event.telemetry?.gps?.lng || mainGateLng, event.telemetry?.gps?.lat || mainGateLat]
  return [lng, lat]
}

export const TripEventsMap = ({
  airport,
  dimensions,
  selectedEvent,
  onMapLoaded,
  events
}: {
  airport: AirportDefinition
  dimensions: Dimensions
  selectedEvent?: VehicleEventType
  onMapLoaded: () => void
  events: VehicleEventType[] // if provided, don't generate fake events
}) => {
  const { bounds: airportBounds, mainGate } = airport
  const {
    mapProps,
    mapViewport,
    setMapViewport,
    mapViewport: { zoom }
  } = useMap({ airport, dimensions })

  const { transition } = useCinematicMap({ zoom, mapViewport, setMapViewport })

  const [defaultZoom, setDefaultZoom] = React.useState(mapProps.maxZoom)
  const selectedEventId = selectedEvent ? getEventId(selectedEvent) : undefined

  const previousSelectedEvent = usePrevious(selectedEvent)
  React.useEffect(() => {
    if (previousSelectedEvent !== selectedEvent) {
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
  }, [previousSelectedEvent, selectedEvent, airportBounds, mainGate, transition])

  React.useEffect(() => {
    setDefaultZoom(mapProps.zoom)
  }, [mapProps.zoom])

  return (
    <MapGL
      {...{
        ...mapProps,
        onLoad: onMapLoaded,
        clickRadius: 5
      }}
    >
      <AirportGeometrySource {...{ airport, defaultZoom, currentZoom: mapProps.zoom }} />

      <EventMarkers {...{ events, mainGate, onClick: () => null, selectedEventId }} />
    </MapGL>
  )
}
