import * as React from 'react'
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import { Layer, LayerProps, Source } from 'react-map-gl'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { getEventId, VehicleEventType } from '@lacuna/ui-common'

const { providerMap } = AirportConsoleConfig

const layer: LayerProps = {
  id: 'events',
  type: 'circle',
  paint: {
    'circle-color': ['get', 'color'],
    'circle-radius': 4,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
  }
}

const iconLayer: LayerProps = {
  id: 'events',
  type: 'symbol',
  source: 'test-icon',
  layout: {
    'icon-image': ['case', ['==', ['get', 'event_types'], 'trip_resume'], 'test-icon-2', 'test-icon']
  },
  paint: {}
}

export const EventSource = ({ events }: { events: VehicleEventType[] }) => {
  const data: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: events.map(event => {
      const { device_id, provider_id, telemetry, event_types } = event
      const id = getEventId(event)
      const { lng, lat } = telemetry?.gps || { lat: undefined, lng: undefined }
      return {
        type: 'Feature',
        properties: {
          color: providerMap[provider_id].colorPalette[500],
          device_id,
          id,
          event_types: event_types[0],
          lat,
          lng
        },
        geometry: {
          type: 'Point',
          coordinates: [lng!, lat!, 0]
        }
      }
    })
  }

  return (
    <Source {...{ type: 'geojson', data }}>
      <Layer {...layer}></Layer>
      <Layer {...iconLayer}></Layer>
    </Source>
  )
}
