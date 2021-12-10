import { useState, useMemo, SetStateAction, Dispatch } from 'react'
import MapGL, { ExtraState, InteractiveMapProps } from 'react-map-gl'
import { AirportConsoleConfig, AirportDefinition } from '@lacuna/agency-config'
import { useTheme } from '@material-ui/core'
import { Dimensions } from 'components'

import { MapViewportState, MapSettingsState } from '../types'

import { fitBounds } from '../helpers'
import { useMapRef } from './useMapRef'

interface UseMapProps {
  mapViewport: MapViewportState
  setMapViewport: Dispatch<SetStateAction<MapViewportState>>
  mapProps: InteractiveMapProps & { ref: (node: MapGL) => void }
}

const {
  apps: {
    airport: {
      mapbox: {
        token,
        general: { fitBoundsMaxZoom },
        mapStyleMap
      }
    }
  }
} = AirportConsoleConfig

export function useMap({
  airport,
  dimensions,
  settings
}: {
  airport: AirportDefinition
  dimensions: Dimensions
  settings?: Partial<MapSettingsState>
}): UseMapProps {
  const theme = useTheme()
  const { width, height } = dimensions
  const { bounds: airportBounds } = airport

  const initialState = useMemo(
    () => ({
      ...fitBounds({
        dimensions,
        bounds: airportBounds,
        padding: 0,
        maxZoom: fitBoundsMaxZoom
      }),
      bearing: 0,
      pitch: 0,
      width,
      height
    }),
    [airportBounds, dimensions, height, width]
  )

  const [mapViewport, setMapViewport] = useState<MapViewportState>(initialState)
  const [mapSettings] = useState<MapSettingsState>({
    dragPan: true,
    scrollZoom: true,
    dragRotate: false,
    touchZoom: false,
    touchRotate: false,
    keyboard: false,
    doubleClickZoom: false,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 85,
    ...(settings || {})
  })
  const [, setMapInteractionState] = useState<ExtraState>({})

  const [ref] = useMapRef()

  return {
    mapViewport,
    setMapViewport,
    mapProps: {
      ref,
      ...mapViewport,
      ...mapSettings,
      mapboxApiAccessToken: token,
      onViewportChange: viewport => setMapViewport(viewport),
      onInteractionStateChange: interactionState => setMapInteractionState(interactionState),
      mapStyle: mapStyleMap[theme.palette.type],
      width: '100%',
      height: '100%'
    }
  }
}
