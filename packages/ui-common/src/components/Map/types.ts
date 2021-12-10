export interface Dimensions {
  width: number
  height: number
}
export interface MapViewportState {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
  // TODO: Restore tranistion behavior with react-mapbox-gl 6.x update
  // transitionDuration?: number | 'auto'
  // transitionInterpolator?: TransitionInterpolator
  // transitionInterruption?: TRANSITION_EVENTS
  // transitionEasing?: EasingFunction
}

/**
 * A sub-set of InteractiveMapProps that pertains to settings so they can be updated &
 * managed independantly with the rest props.
 */
export interface MapSettingsState {
  width: number
  height: number
  dragPan: boolean
  dragRotate: boolean
  scrollZoom: boolean
  touchZoom: boolean
  touchRotate: boolean
  keyboard: boolean
  doubleClickZoom: boolean
  minZoom: number
  maxZoom: number
  minPitch: number
  maxPitch: number
  attributionControl: boolean
}
