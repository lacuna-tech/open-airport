/* eslint-disable no-console */
import React from 'react'
import { Point } from 'geojson'
import { Source, Layer, LayerProps } from 'react-map-gl'
import { MapSourceProps } from './types'

const MAX_ZOOM_LEVEL = 20

const layer: LayerProps = {
  type: 'heatmap',
  source: 'trees',
  maxzoom: MAX_ZOOM_LEVEL,
  paint: {
    // use 0.75 when zoom = 10, use 0 when zoom = 20, interpolate everything in-between
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.75, 20, 0],

    // increase weight as diameter breast height increases
    'heatmap-weight': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [1, 0],
        [62, 1]
      ]
    },
    // increase intensity as zoom level increases
    'heatmap-intensity': {
      stops: [
        [11, 1],
        [15, 3]
      ]
    },
    // use sequential color palette to use exponentially as the weight increases
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(236,222,239,0)',
      0.2,
      'rgb(208,209,230)',
      0.4,
      'rgb(166,189,219)',
      0.6,
      'rgb(103,169,207)',
      0.8,
      'rgb(28,144,153)'
    ],
    // increase radius as zoom increases
    'heatmap-radius': {
      stops: [
        [11, 15],
        [15, 20]
      ]
    }
  }
}

export type HeatSourceProps = MapSourceProps<Point>

export const HeatSource: React.FC<HeatSourceProps> = ({ id = 'trees-heat', data }) => {
  return (
    <Source
      {...{
        id,
        type: 'geojson',
        data
      }}
    >
      <Layer {...layer} id={id} />
    </Source>
  )
}
