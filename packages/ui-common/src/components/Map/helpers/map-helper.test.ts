import { Feature, MultiPolygon, Point, Polygon } from 'geojson'
import { geographyFeatureFromGeojson, getGeographiesBounds, getGeographyBounds, getPointBounds } from './map-helper'

const pointFeature: Feature<Point> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Point',
    coordinates: [-122.3493, 47.6205]
  }
}

const pointBounds = [
  [-122.34970667259853, 47.62077411283809],
  [-122.34889332740148, 47.620225887161915]
]

const polygonFeature: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-122.34934777021407, 47.62066174448532],
        [-122.3495677113533, 47.620473721969276],
        [-122.34936252236366, 47.62028569877702],
        [-122.34893471002579, 47.62035982338546],
        [-122.34900847077368, 47.620557789812416],
        [-122.34934777021407, 47.62066174448532]
      ]
    ]
  }
}

const polygonBounds = [
  [-122.3495677113533, 47.62066174448532],
  [-122.34893471002579, 47.62028569877702]
]

const multiPolygonFeature: Feature<MultiPolygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-122.34933704137802, 47.62080095302787],
          [-122.3493705689907, 47.620715981623896],
          [-122.34923109412193, 47.62066626424901],
          [-122.34921500086783, 47.62077021870622],
          [-122.34933704137802, 47.62080095302787]
        ]
      ],
      [
        [
          [-122.34921902418137, 47.62082897548188],
          [-122.34918147325516, 47.62070965396064],
          [-122.34907686710356, 47.62076750685342],
          [-122.34921902418137, 47.62082897548188]
        ]
      ]
    ]
  }
}

describe('geographyFeatureFromGeojson', () => {
  it('converts point geometries to circular polygon geometries', () => {
    const feature = geographyFeatureFromGeojson(
      {
        type: 'FeatureCollection',
        features: [pointFeature]
      },
      // Helps to insulate against default circular resolution changes.
      { pointGeometryCircleResolution: 64 }
    )

    // Circle is pretty data-heavy with 64 verticies, so we'll use a snapshot.
    expect(feature).toMatchSnapshot()
  })

  it('leaves Polygon & MultiPolygon features unchanged', () => {
    const feature = geographyFeatureFromGeojson({
      type: 'FeatureCollection',
      features: [polygonFeature, multiPolygonFeature]
    })

    expect(feature).toEqual({
      type: 'FeatureCollection',
      features: [polygonFeature, multiPolygonFeature]
    })
  })
})

describe('getGeographyBounds', () => {
  it('returns the correct bounds for a Polygon-based geography', () => {
    const bounds = getGeographyBounds({
      geography: {
        geography_json: {
          type: 'FeatureCollection',
          features: [polygonFeature]
        }
      }
    })

    expect(bounds).toEqual(polygonBounds)
  })

  it('returns the correct bounds for a Point-based geography (assume 100ft radius)', () => {
    const bounds = getGeographyBounds({
      geography: {
        geography_json: {
          type: 'FeatureCollection',
          features: [pointFeature]
        }
      }
    })

    expect(bounds).toEqual(pointBounds)
  })
})

describe('getGeographiesBounds', () => {
  it('returns the correct bounds for multiple Polygon-based geographies', () => {
    const bounds = getGeographiesBounds({
      geographies: [
        {
          geography_json: {
            type: 'FeatureCollection',
            features: [polygonFeature]
          }
        },
        {
          geography_json: {
            type: 'FeatureCollection',
            features: [multiPolygonFeature]
          }
        }
      ]
    })

    expect(bounds).toEqual([
      [-122.3495677113533, 47.62082897548188],
      [-122.34893471002579, 47.62028569877702]
    ])
  })

  it('returns the correct bounds for a mix of Polygon & Point-based geography (assume 100ft radius)', () => {
    const bounds = getGeographiesBounds({
      geographies: [
        {
          geography_json: {
            type: 'FeatureCollection',
            features: [pointFeature]
          }
        },
        {
          geography_json: {
            type: 'FeatureCollection',
            features: [multiPolygonFeature]
          }
        }
      ]
    })

    expect(bounds).toEqual([
      [-122.34970667259853, 47.62082897548188],
      [-122.34889332740148, 47.620225887161915]
    ])
  })
})

describe('getPointBounds', () => {
  it('returns zero-width bounds', () => {
    const bounds = getPointBounds({
      point: {
        type: 'Point',
        coordinates: [-122.3493, 47.6205]
      }
    })

    expect(bounds).toEqual([
      [-122.3493, 47.6205],
      [-122.3493, 47.6205]
    ])
  })
})
