import { LngLatBoundsLike } from 'mapbox-gl'
import React from 'react'
import MapGL from 'react-map-gl'

import { useMap } from './hooks'
import { makeViewState } from './helpers'
import { Dimensions } from './types'
import { MapContainer } from './MapContainer'

interface MapImplProps {
  dimensions: Dimensions
  bounds: LngLatBoundsLike
  onLoad?: () => void
}

const MapImpl: React.FunctionComponent<MapImplProps> = ({ dimensions, bounds, onLoad, children }) => {
  const { mapProps } = useMap(
    () => ({
      dimensions,
      initialViewState: makeViewState({ dimensions, bounds, padding: 25 })
    }),
    [dimensions, bounds]
  )

  return (
    <MapGL {...mapProps} onLoad={onLoad}>
      {children}
    </MapGL>
  )
}

const worldMapBounds: LngLatBoundsLike = [
  [-180, 85],
  [180, -85]
]

export interface InteractiveMapProps {
  bounds?: LngLatBoundsLike
  loading?: boolean
}

export const InteractiveMap: React.FunctionComponent<InteractiveMapProps> = ({
  bounds = worldMapBounds,
  loading = false,
  children
}) => (
  <MapContainer dependenciesLoading={loading}>
    {(onMapLoaded, dimensions) => (
      <MapImpl dimensions={dimensions} bounds={bounds} onLoad={onMapLoaded}>
        {children}
      </MapImpl>
    )}
  </MapContainer>
)
