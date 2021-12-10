import calculateDistance from '@turf/distance'
import { WebMercatorViewport } from 'react-map-gl'
import { MapViewportState } from 'components/Map/types'
import { Dimensions } from 'components'
import { LngLatBounds, LngLatBoundsLike } from 'mapbox-gl'

export const fitBounds: (options: {
  dimensions: Dimensions
  bounds: LngLatBoundsLike
  padding: number | number[]
  maxZoom: number
}) => Pick<MapViewportState, 'latitude' | 'longitude' | 'zoom'> = ({ dimensions, bounds, padding, maxZoom }) => {
  const { width } = dimensions
  // WebMercatorViewport's Bounds does not play well with Mapbox's Bounds, so a crude
  // array composition is needed.
  const coordinates = LngLatBounds.convert(bounds).toArray()
  const webMercatorBounds: [[number, number], [number, number]] = [
    [coordinates[0][0], coordinates[0][1]],
    [coordinates[1][0], coordinates[1][1]]
  ]
  const { latitude, longitude, zoom } = new WebMercatorViewport(dimensions).fitBounds(webMercatorBounds, {
    // Note: This can crash when padding is too large. E.g., left+right >= width, or top+bottom >= height.
    // You can more easily encounter crashes like this if chrome dev-tools is open pretty wide. The solve for
    // this is to use zoom scaled padding.
    padding: Array.isArray(padding)
      ? {
          top: padding[0],
          right: Math.min(padding[1], width - padding[3] - 1),
          bottom: padding[2],
          left: padding[3]
        }
      : padding
  })

  return { latitude, longitude, zoom: Math.min(zoom, maxZoom) }
}

export const getDistance = (
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
) =>
  calculateDistance(
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [start.longitude, start.latitude]
      }
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [end.longitude, end.latitude]
      }
    }
  )
