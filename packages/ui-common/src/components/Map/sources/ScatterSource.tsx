import React from 'react'
import { Source, Layer, LayerProps } from 'react-map-gl'
import { Point } from 'geojson'
import { MapSourceProps } from './types'

export const scatterLayerProps: LayerProps = {
  type: 'circle',
  filter: ['!=', 'cluster', true],
  paint: {
    'circle-radius': {
      base: 2,
      stops: [
        [1, 1],
        [14, 6],
        [15, 7]
      ]
    },
    'circle-color': ['get', 'color']
  }
}

export type ScatterSourceProps = MapSourceProps<Point>

export const ScatterSource: React.FC<ScatterSourceProps> = ({ id = 'scatter-points', data }) => {
  return (
    <Source id={id} type='geojson' data={data}>
      <Layer {...scatterLayerProps} id={id} />
    </Source>
  )
}
