/* eslint-disable no-console */
import React from 'react'
import MapGL from 'react-map-gl'
import { AirportDefinition } from '@lacuna/agency-config'
import { Dimensions } from 'components'
import { VehicleEventType } from '@lacuna/ui-common'
import { AirportGeometrySource, EventSource } from './sources'
import { useMap } from './hooks'

export function EventPreviewMap({
  events,
  dimensions,
  airport,
  onMapLoaded
}: {
  events: VehicleEventType[]
  dimensions: Dimensions
  airport: AirportDefinition
  onMapLoaded: () => void
}) {
  const { mapProps } = useMap({
    airport,
    dimensions,
    settings: {
      dragPan: false,
      scrollZoom: false
    }
  })

  return (
    <MapGL {...{ ...mapProps, onLoad: onMapLoaded }}>
      <AirportGeometrySource
        {...{ airport, currentZoom: mapProps.zoom, defaultZoom: mapProps.zoom, hideLabels: true }}
      />
      <EventSource {...{ events }} />
    </MapGL>
  )
}
