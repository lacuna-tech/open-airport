/* eslint-disable no-console */
import React from 'react'
import { Source, Layer, LayerProps } from 'react-map-gl'
import { FeatureCollection, GeoJsonProperties, Point } from 'geojson'
import { LngLatBoundsLike, LngLatBounds } from 'mapbox-gl'
import { Polygon, BBox } from '@turf/helpers'
import turfHexGrid from '@turf/hex-grid'
import turfSquareGrid from '@turf/square-grid'
import turfTriangleGrid from '@turf/triangle-grid'
import { useTheme } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { buildColorRamp, spatialIntersect } from '../helpers'
import { MapSourceProps } from './types'

// Goes from [[x1, y1], [x2, y2]] to [x1, y1, x2, y2]
const flattenBounds: (bounds: LngLatBoundsLike) => BBox = bounds => {
  const [[swLng, swLat], [neLng, neLat]] = LngLatBounds.convert(bounds).toArray()
  return [swLng, swLat, neLng, neLat]
}

const hexBin: (options: {
  bounds: LngLatBoundsLike
  cellSize: number
  data: FeatureCollection<Point, GeoJsonProperties>
}) => FeatureCollection<Polygon, GeoJsonProperties> = ({ bounds, cellSize, data }) => {
  // const hexGrid = turf.hexGrid(flattenBounds(bounds), cellSize, { units: 'meters' })
  const hexGrid = turfHexGrid(flattenBounds(bounds), cellSize, { units: 'meters' })
  const squareGrid = turfSquareGrid(flattenBounds(bounds), cellSize, { units: 'meters' })
  const triangleGrid = turfTriangleGrid(flattenBounds(bounds), cellSize, { units: 'meters' })
  console.log({ hexGrid, triangleGrid, squareGrid })
  return spatialIntersect({ grid: hexGrid, data })
}

export interface TurfSourceProps extends MapSourceProps<Point> {
  color: string
  bounds: LngLatBoundsLike
}

export const TurfSource: React.FC<TurfSourceProps> = ({ id = 'hexBinLarge', data, color, bounds }) => {
  const theme = useTheme()
  const layer: (opacity: number) => LayerProps = opacity => ({
    type: 'fill',
    layout: {},
    paint: {
      'fill-color': {
        property: 'count',
        stops: buildColorRamp('rgba(0,0,0,0)', color, 0, 35, 10)
        // stops: buildColorRamp('rgba(0,0,0,0)', '#990000', 0, 10, 10)
      },
      'fill-opacity': opacity,
      'fill-outline-color': grey[theme.palette.type === 'light' ? 200 : 800]
    }
  })

  const hexBinDataLarge = hexBin({ bounds, data, cellSize: 35 }) as FeatureCollection<Polygon, GeoJsonProperties>
  // const hexBinDataSmall = hexBin({ bounds, data, cellSize: 35 }) as FeatureCollection<Polygon, GeoJsonProperties>
  // const hexBinData = { ...hexBinDataSmall, features: [...hexBinDataSmall.features, ...hexBinDataLarge.features] }

  return (
    <>
      <Source
        {...{
          id,
          type: 'geojson',
          data: hexBinDataLarge,
          key: 'hexBinLarge'
        }}
      >
        <Layer {...layer(1)} id={id} />
      </Source>
    </>
  )
}
