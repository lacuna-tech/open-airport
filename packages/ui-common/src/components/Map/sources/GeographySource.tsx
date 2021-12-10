import React from 'react'
import { blue } from '@material-ui/core/colors'
import { Polygon, MultiPolygon, Point } from 'geojson'
import { Source, Layer, LayerProps } from 'react-map-gl'

import { MapSourceProps } from './types'
import { geographyFeatureFromGeojson } from '../helpers'

export const geographiesFillLayerProps: LayerProps = {
  type: 'fill',
  paint: {
    'fill-color': ['get', 'geography_color'] || blue[800],
    'fill-opacity': 0.3
  }
}

export const geographiesBorderLayerProps: LayerProps = {
  type: 'line',
  paint: {
    'line-width': 2,
    'line-color': ['get', 'geography_color'] || blue[800]
  }
}

export interface GeographySourceProps extends MapSourceProps<Polygon | MultiPolygon | Point> {
  fillLayerId?: string
  outlineLayerId?: string
}

export const GeographySource: React.FC<GeographySourceProps> = ({
  id = 'geography',
  fillLayerId,
  outlineLayerId,
  data
}) => {
  const transformedData = React.useMemo(() => geographyFeatureFromGeojson(data), [data])
  return (
    <Source id={id} type='geojson' data={transformedData}>
      <Layer {...geographiesBorderLayerProps} id={outlineLayerId || `${id}-outline`} />
      <Layer {...geographiesFillLayerProps} id={fillLayerId || id} />
    </Source>
  )
}
