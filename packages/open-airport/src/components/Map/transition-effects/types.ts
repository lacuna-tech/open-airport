import { MapViewportState } from '../types'

export type TransitionEffect = (options: {
  zoom: number
  mapViewport: MapViewportState
  transitionZoom: number
  transitionLongitude: number
  transitionLatitude: number
}) => Partial<MapViewportState>
