/* eslint-disable no-console */
import React from 'react'
import { Source, Layer } from 'react-map-gl'
import { Expression, SymbolLayout } from 'mapbox-gl'
import { AirportDefinition } from '@lacuna/agency-config'
import { useVisibleGeographies } from 'hooks'

const scalingTextSize: Expression = ['interpolate', ['linear'], ['zoom'], 0, 5, 17, 15] // font-size 5 at zoom 0, font-size 12 at zoom 17??

const labelStyle = {
  id: 'labels',
  type: 'symbol',
  paint: {
    'text-color': '#363636'
  },
  layout: {
    'text-field': '{label}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': scalingTextSize
  } as SymbolLayout
}

const lotStyle = {
  id: 'lot',
  type: 'fill',
  paint: {
    'fill-color': '#0059ff',
    'fill-opacity': 0.2
  }
}

export function AirportGeometrySource({
  airport: {
    sources: { labels }
  },
  currentZoom,
  defaultZoom,
  hideLabels
}: {
  airport: AirportDefinition
  currentZoom: number | undefined
  defaultZoom: number | undefined
  hideLabels?: boolean
}) {
  const { geoJsonRaw } = useVisibleGeographies()

  return (
    <>
      <Source type='geojson' data={geoJsonRaw.data}>
        <Layer {...lotStyle} />
      </Source>

      {defaultZoom && currentZoom && currentZoom <= defaultZoom && hideLabels !== true && (
        <Source type='geojson' data={labels.data}>
          <Layer {...labelStyle} />
        </Source>
      )}
    </>
  )
}
