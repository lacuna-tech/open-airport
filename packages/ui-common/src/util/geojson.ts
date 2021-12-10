import { BBox, Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { LngLatBoundsLike } from 'mapbox-gl'

export const isFeatureCollection = <G extends Geometry, P = GeoJsonProperties>(
  obj: Feature<G, P> | FeatureCollection<G, P>
): obj is FeatureCollection<G, P> => {
  return 'features' in obj
}

export const firstFeature: <G extends Geometry, P = GeoJsonProperties>(
  geography_json: Feature<G, P> | FeatureCollection<G, P>
) => Feature = geography_json => {
  return isFeatureCollection(geography_json) ? geography_json.features[0] : geography_json
}

export const bboxToLngLatBounds = (bounds: BBox): LngLatBoundsLike =>
  bounds.slice(0, 4) as [number, number, number, number]
