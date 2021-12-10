// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import { geographies as geo } from '@lacuna/ui-common'
import { useSelector } from 'react-redux'
import { GeoJSONSourceRaw } from 'mapbox-gl'

export const useVisibleGeographies = () => {
  const geographies = useSelector(geo.selectors.selectGeographiesVisible)
  const geoJsonRawFeatures = geographies.map(g => g.geography_json.features).flat()
  const geoJsonRaw: GeoJSONSourceRaw = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: geoJsonRawFeatures
    }
  }
  return { geographies, geoJsonRaw }
}
