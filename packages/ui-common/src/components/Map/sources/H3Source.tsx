/* eslint-disable no-console */
import React from 'react'
import { Source, Layer, LayerProps } from 'react-map-gl'
import { FeatureCollection, GeoJsonProperties, Point, Polygon } from 'geojson'
import { LngLatBoundsLike, LngLatBounds } from 'mapbox-gl'
import { polyfill, h3ToGeoBoundary } from 'h3-js'
import { buildColorRamp, spatialIntersect } from '../helpers'
import { MapSourceProps } from './types'

const hexBin: (options: {
  bounds: LngLatBoundsLike
  resolution: number
  data: FeatureCollection<Point, GeoJsonProperties>
}) => FeatureCollection<Polygon, GeoJsonProperties> = ({ bounds, resolution, data }) => {
  const b = LngLatBounds.convert(bounds).toArray()
  const boundingSquare = [b[0], [b[0][0], b[1][1]], b[1], [b[1][0], b[0][1]], b[0]]

  const hexagons = polyfill(boundingSquare, resolution, true)

  const grid: FeatureCollection<Polygon, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: hexagons.map(h => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [h3ToGeoBoundary(h, true)]
      }
    }))
  }

  return spatialIntersect({ grid, data })
}

export interface H3SourceProps extends MapSourceProps<Point> {
  color: string
  bounds: LngLatBoundsLike
}

export const H3Source: React.FC<H3SourceProps> = ({ id = 'h3', data, color, bounds }) => {
  const hexBinDataLarge = hexBin({ bounds, data, resolution: 9 })
  // const hexBinDataSmall = hexBin({ bounds, data, resolution: 11 })
  // const hexBinData = { ...hexBinDataSmall, features: [...hexBinDataLarge.features, ...hexBinDataSmall.features] }

  const layer: (opacity: number) => LayerProps = opacity => ({
    type: 'fill',
    layout: {},
    paint: {
      'fill-color': {
        property: 'count',
        stops: buildColorRamp('rgba(0,0,0,0)', color, 0, 10, 10)
      },
      'fill-opacity': opacity
    }
  })

  return (
    <>
      <Source
        {...{
          id,
          type: 'geojson',
          data: hexBinDataLarge
        }}
      >
        <Layer {...layer(1)} id={id} />
      </Source>
    </>
  )
}
