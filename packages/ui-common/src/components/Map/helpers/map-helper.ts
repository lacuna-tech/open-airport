import { WebMercatorViewport } from 'react-map-gl'
import { LngLatBounds, LngLatBoundsLike } from 'mapbox-gl'
import bbox from '@turf/bbox'
import circle from '@turf/circle'
import { Geography } from '@mds-core/mds-types'
import { Feature, FeatureCollection, GeoJsonProperties, Point, Polygon, MultiPolygon } from 'geojson'
import { interpolateRgb } from 'd3-interpolate'
import collect from '@turf/collect'
import * as simpleStats from 'simple-statistics'
import * as d3Array from 'd3-array'
import * as meta from '@turf/meta'
import { CommonConfig } from '@lacuna/agency-config'
import { Dimensions, MapViewportState } from '../types'

const {
  mapBox: {
    options: { fitBoundsMaxZoom }
  }
} = CommonConfig

export const fitBounds: (options: {
  dimensions: Dimensions
  bounds: LngLatBoundsLike
  padding: number | number[]
  maxZoom: number
}) => {
  latitude: number
  longitude: number
  zoom: number
} = ({ dimensions, bounds, padding, maxZoom }) => {
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
interface GeographyFeatureFromGeojsonOptions {
  /**
   * Number of verticies to give circular polygons generated from point geographies. Defaults to 64.
   */
  pointGeometryCircleResolution?: number
}

export const geographyFeatureFromGeojson = (
  geographyJson: FeatureCollection,
  options?: GeographyFeatureFromGeojsonOptions
): FeatureCollection<Polygon | MultiPolygon> => ({
  type: 'FeatureCollection',
  features: geographyJson.features.map(feat => {
    if (feat.geometry.type !== 'Point') {
      return feat as Feature<Polygon | MultiPolygon>
    }
    return circle(feat.geometry, 100, { units: 'feet', steps: options?.pointGeometryCircleResolution ?? 64 })
  })
})

export const getGeographyBounds: (options: { geography: Pick<Geography, 'geography_json'> }) => LngLatBoundsLike = ({
  geography: { geography_json }
}) => {
  const geographyFeature = geographyFeatureFromGeojson(geography_json)
  const [minLng, minLat, maxLng, maxLat] = bbox(geographyFeature)
  return [
    [minLng, maxLat], // SW
    [maxLng, minLat] // NE
  ]
}

export const getGeographiesBounds: (options: {
  geographies: Pick<Geography, 'geography_json'>[]
}) => LngLatBoundsLike = ({ geographies }) =>
  geographies.reduce<[[number, number], [number, number]]>(
    ([[globalMinLng, globalMaxLat], [globalMaxLng, globalMinLat]], { geography_json }) => {
      // FIXME: should this use getGeographyBounds?
      const geographyFeature = geographyFeatureFromGeojson(geography_json)
      const [localMinLng, localMinLat, localMaxLng, localMaxLat] = bbox(geographyFeature)
      return [
        [Math.min(localMinLng, globalMinLng), Math.max(localMaxLat, globalMaxLat)],
        [Math.max(localMaxLng, globalMaxLng), Math.min(localMinLat, globalMinLat)]
      ]
    },
    [
      [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER], // SW
      [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER] // NE
    ]
  )

export const getPointBounds: (options: { point: Point }) => LngLatBoundsLike = ({
  point: {
    coordinates: [lng, lat]
  }
}) => {
  return [
    [lng, lat], // SW
    [lng, lat] // NE
  ]
}

export type BoundsInputOptions<T> = {
  pois: T[]
  toLngLat: (poi: T) => { latitude: number; longitude: number } | undefined
}

export function getBounds<T>({ pois, toLngLat }: BoundsInputOptions<T>): LngLatBoundsLike {
  let minLng = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  for (const poi of pois) {
    const lnglat = toLngLat(poi)
    if (lnglat) {
      const { latitude, longitude } = lnglat
      minLng = Math.min(minLng, longitude)
      minLat = Math.min(minLat, latitude)
      maxLng = Math.max(maxLng, longitude)
      maxLat = Math.max(maxLat, latitude)
    }
  }

  return [
    [minLng, maxLat], // SW
    [maxLng, minLat] // NE
  ]
}

export const makeViewState: (options: {
  dimensions: Dimensions
  bounds: LngLatBoundsLike
  padding?: number
  maxZoom?: number
}) => MapViewportState = ({ dimensions, bounds, padding, maxZoom }) => ({
  ...fitBounds({
    dimensions,
    bounds,
    padding: padding || 0,
    maxZoom: maxZoom || fitBoundsMaxZoom
  }),
  bearing: 0,
  pitch: 0
})

// This is a real gem of a function. Essentially you provide a
// grid of polygons that represent spatial bins (think hex, squares, triangles, whatever)
// and also provide a set of points that represent entities (think vehicles)
// and what you get in return is the original grid of polygons with data in the properties
// indicating the count of entities contained within the polygon.
// Adapted from https://gist.github.com/clhenrick/5787a12a8bf3b02821839e4f9556d997
export const spatialIntersect = ({
  grid,
  data
}: {
  grid: FeatureCollection<Polygon, GeoJsonProperties>
  data: FeatureCollection<Point, GeoJsonProperties>
}) => {
  if (grid.features.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to spatialIntersect on geojson without features.')
    return grid
  }

  // create the hexbin geometry for the given bbox and cell resolution
  // perform a "spatial join" on our grid geometry and our point data
  const collected = collect(grid, data, 'id', 'values')

  // get rid of polygons with no joined data, to reduce our final output file size
  collected.features = collected.features.filter(d => d.properties?.values.length)

  // count the number of instances per hexbin
  meta.propEach(collected, props => {
    if (props) {
      // eslint-disable-next-line no-param-reassign
      props.count = props.values.length
    }
  })

  // reduce our count values to a new array of numbers
  const reduced = meta.featureReduce(
    collected,
    (acc: number[], cur: Feature<Polygon, GeoJsonProperties>) => {
      return [...acc, cur.properties?.count]
    },
    []
  )

  // compute the ckMeans binning for data into 7 classes from reduced values
  const ck = simpleStats.ckmeans(reduced, Math.min(15, reduced.length))

  // tack on the bin number to our data, as well as its min and max values
  meta.propEach(collected, props => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ck.forEach((bin: any, index: any) => {
      if (props && bin.indexOf(props.count) > -1) {
        // eslint-disable-next-line no-param-reassign
        props.bin = index
        // eslint-disable-next-line no-param-reassign
        props.binVal = d3Array.extent(bin)
      }
    })
  })

  // remove the "values" property from our hexBins as it's no longer needed
  meta.propEach(collected, props => {
    // eslint-disable-next-line no-param-reassign
    if (props) delete props.values
  })

  return collected
}

/* Builds a color ramp between 2 colors. This is very useful for mapbox color based step styles */
export const buildColorRamp = (
  startColor: string,
  endColor: string,
  startNumber: number,
  endNumber: number,
  totalCount: number
) => {
  const colorRamp = interpolateRgb(startColor, endColor)
  const stepSize = (endNumber - startNumber) / (totalCount - 1)
  return Array.from({ length: totalCount }, (v, k) => k / (totalCount - 1)).map((v, i) => [
    startNumber + stepSize * i,
    colorRamp(v)
  ])
}
