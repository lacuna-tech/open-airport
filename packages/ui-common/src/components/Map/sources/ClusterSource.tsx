import React from 'react'
import { Source, Layer, LayerProps } from 'react-map-gl'
import { Point } from 'geojson'
import { MapSourceProps } from './types'

export interface ClusterSourceProps extends MapSourceProps<Point> {
  countLayerId?: string
}

export const ClusterSource: React.FC<ClusterSourceProps> = ({ id = 'clusters', countLayerId, data }) => {
  const clusterLayer: LayerProps = {
    type: 'circle',
    source: 'earthquakes',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#999', 25, '#f1f075', 200, '#f28cb1'],
      // 'circle-radius': ['step', ['get', 'point_count'], 20, 200, 30, 750, 40]
      'circle-radius': ['step', ['get', 'point_count'], 15, 20, 25, 200, 30, 750, 40]
    }
  }

  const clusterCountLayer: LayerProps = {
    type: 'symbol',
    paint: {
      'text-color': '#555'
    },
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  }

  return (
    <Source
      {...{
        id,
        type: 'geojson',
        cluster: true,
        maxzoom: 20,
        clusterMaxZoom: 15,
        clusterRadius: 60, // 20
        clusterProperties: {
          totalCount: ['get', 'totalCount'],
          status: ['max', ['get', 'status']]
        },
        data
      }}
    >
      <Layer {...clusterLayer} id={id} />
      <Layer {...clusterCountLayer} id={countLayerId || `${id}-count`} />
    </Source>
  )
}
