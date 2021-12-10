import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'

export interface MapSourceProps<Geo extends Geometry> {
  data: FeatureCollection<Geo, GeoJsonProperties>
  id?: string
}
