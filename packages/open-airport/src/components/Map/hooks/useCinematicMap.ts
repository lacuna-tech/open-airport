import { SetStateAction, Dispatch, useCallback } from 'react'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { LngLatBoundsLike } from 'mapbox-gl'
import { fitBounds } from '../helpers'
import { MapViewportState, Padding } from '../types'
import { TransitionEffect } from '../transition-effects'

const DEFAULT_VIEWPORT_ZOOM = 18 // used for single set of coords, not bounds

interface FitToBoundsProps {
  padding: Padding | number
  lngLat?: [number, number]
  bounds?: LngLatBoundsLike
  transitionEffect: TransitionEffect
}

interface UseCinematicMapProps {
  transition: (options: FitToBoundsProps) => void
}

const {
  apps: {
    airport: {
      mapbox: {
        general: { fitBoundsMaxZoom }
      }
    }
  }
} = AirportConsoleConfig

export function useCinematicMap({
  zoom,
  mapViewport,
  setMapViewport
}: {
  zoom: number
  mapViewport: MapViewportState
  setMapViewport: Dispatch<SetStateAction<MapViewportState>>
}): UseCinematicMapProps {
  const transition: (options: FitToBoundsProps) => void = useCallback(
    ({ padding, lngLat, bounds, transitionEffect }) => {
      if (bounds) {
        const { longitude: transitionLongitude, latitude: transitionLatitude, zoom: transitionZoom } = fitBounds({
          dimensions: mapViewport,
          bounds,
          padding,
          maxZoom: fitBoundsMaxZoom
        })

        setMapViewport({
          ...mapViewport,
          longitude: transitionLongitude,
          latitude: transitionLatitude,
          zoom: transitionZoom,
          ...transitionEffect({ zoom, mapViewport, transitionZoom, transitionLongitude, transitionLatitude })
        })
      } else if (lngLat) {
        setMapViewport({
          ...mapViewport,
          longitude: lngLat[0],
          latitude: lngLat[1],
          zoom: zoom > DEFAULT_VIEWPORT_ZOOM ? zoom : DEFAULT_VIEWPORT_ZOOM,
          ...transitionEffect({
            zoom,
            mapViewport,
            transitionZoom: zoom > DEFAULT_VIEWPORT_ZOOM ? zoom : DEFAULT_VIEWPORT_ZOOM,
            transitionLatitude: lngLat[1],
            transitionLongitude: lngLat[0]
          })
        })
      }
    },
    [mapViewport, setMapViewport, zoom]
  )

  return {
    transition
  }
}
