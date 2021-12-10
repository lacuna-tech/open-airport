import { FlyToInterpolator } from 'react-map-gl'
import { easeQuadInOut } from 'd3-ease'
import { TransitionEffect } from './types'
import { getDistance } from '../helpers'

export const FlyToTransition: TransitionEffect = ({
  zoom,
  mapViewport,
  transitionZoom,
  transitionLongitude,
  transitionLatitude
}) => {
  const zoomDelta = Math.min(3, Math.max(1, Math.abs(transitionZoom - zoom) * 0.5))
  const transitionDuration = Math.max(
    500, // min duration 0.5s
    Math.min(
      2000, // max duration 2s
      (1000 * getDistance(mapViewport, { longitude: transitionLongitude, latitude: transitionLatitude })) / zoomDelta
    )
  )

  return {
    transitionInterpolator: new FlyToInterpolator({
      speed: 1.2
    }),
    transitionEasing: easeQuadInOut,
    transitionDuration
  }
}
