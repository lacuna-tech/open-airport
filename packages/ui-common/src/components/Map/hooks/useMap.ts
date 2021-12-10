import { useState, useMemo, SetStateAction, Dispatch, useEffect } from 'react'
import { InteractiveMapProps, State } from 'react-map-gl/src/components/interactive-map'
import { CommonConfig, MapStyle } from '@lacuna/agency-config'
import { Dimensions, MapViewportState, MapSettingsState } from '../types'
import { useMapRef } from './useMapRef'
import { usePalette } from '../../../hooks'

interface UseMapProps {
  mapViewport: MapViewportState
  setMapViewport: Dispatch<SetStateAction<MapViewportState>>
  mapProps: InteractiveMapProps // & { ref: (node: MapGL) => void }
  setMapStyle: (mapStyle: MapStyle) => void
}

const {
  mapBox: {
    token,
    mapStyles,
    options: { fitBoundsMaxZoom }
  },
  theme: {
    palette: { type: configuredPaletteType }
  }
} = CommonConfig

export function useMap(
  factory: () => {
    dimensions: Dimensions
    settings?: Partial<MapSettingsState>
    useStyles?: boolean
    initialMapStyle?: MapStyle
    initialViewState: MapViewportState
  },
  deps: React.DependencyList
): UseMapProps {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { dimensions, settings, useStyles, initialViewState, initialMapStyle } = useMemo(factory, deps)

  const { width, height } = dimensions
  const [mapViewport, setMapViewport] = useState<MapViewportState>(initialViewState)
  const [mapSettings] = useState<MapSettingsState>({
    // Reasonable default settings
    dragPan: true,
    scrollZoom: true,
    dragRotate: true,
    touchZoom: false,
    touchRotate: false,
    keyboard: false,
    doubleClickZoom: false,
    minZoom: 0,
    maxZoom: fitBoundsMaxZoom,
    minPitch: 0,
    maxPitch: 85,
    width,
    height,
    attributionControl: !useStyles,
    // Any overridden settings
    ...(settings || {})
  })
  const [, setMapInteractionState] = useState<State>({ isLoaded: true, isHovering: false, isDragging: false })
  const [ref] = useMapRef()

  const [paletteType] = usePalette(configuredPaletteType)
  const [mapStyle, setMapStyle] = useState<MapStyle>(initialMapStyle || 'road')

  // Allow for initialViewState changes to update the mapViewport state. Must be careful about updating
  // initialViewState with regular data updates or else the map will be re-centering unexpectidly. This
  // is needed for scenarios where the map bounds aren't known until downstream data is loaded, such as
  // vehicle details page and framing a map around it's events. The absence/presence of initialViewState
  // in the dependencies of this hook should help drive desired behaior.
  useEffect(() => {
    setMapViewport(initialViewState)
  }, [setMapViewport, initialViewState])

  return {
    mapViewport,
    setMapViewport,
    setMapStyle,
    mapProps: {
      ref,
      ...mapViewport,
      ...mapSettings,
      mapboxApiAccessToken: token,
      onViewportChange: (viewport: MapViewportState) => setMapViewport(viewport),
      onInteractionStateChange: (interactionState: State) => setMapInteractionState(interactionState),
      mapStyle: useStyles || useStyles === undefined ? mapStyles[mapStyle].url[paletteType] : undefined,
      width: '100%',
      height: '100%'
    }
  }
}
