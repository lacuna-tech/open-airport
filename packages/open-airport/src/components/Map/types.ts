import { EasingFunction, TransitionInterpolator, TRANSITION_EVENTS } from 'react-map-gl'

export type Padding = [number, number, number, number]

export interface MapViewportState {
  width: number
  height: number
  latitude: number
  longitude: number
  zoom: number
  bearing: number
  pitch: number
  transitionDuration?: number | 'auto'
  transitionInterpolator?: TransitionInterpolator
  transitionInterruption?: TRANSITION_EVENTS
  transitionEasing?: EasingFunction
}

export interface MapSettingsState {
  dragPan: boolean
  dragRotate: boolean
  scrollZoom: boolean
  touchZoom: boolean
  touchRotate: boolean
  keyboard: boolean
  doubleClickZoom: boolean
  minZoom: 0
  maxZoom: 20
  minPitch: 0
  maxPitch: 85
}
