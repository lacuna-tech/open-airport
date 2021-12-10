import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { UUID } from '@mds-core/mds-types'
import { Color, PaletteType } from '@material-ui/core'
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons'
import { GeoJSONSourceRaw, LngLatBoundsLike, LngLatLike } from 'mapbox-gl'

export type AgencyKey = 'lax'

export interface AirportDefinition {
  agency_key: AgencyKey
  name: string
  bounds: LngLatBoundsLike
  mainGate: LngLatLike
  areasOfInterest: AreaOfInterest[]
  sources: {
    labels: GeoJSONSourceRaw
    outlines: GeoJSONSourceRaw
  }
  icon: IconDefinition
}

export type AirportDefinitionMap = {
  [key in UUID]: AirportDefinition
}

export interface Link {
  label: string
  url: string
  description: string
  icon: IconProp
}

export type ProviderMap = {
  [key in UUID]: {
    provider_name: string
    provider_id: string
    colorPalette: Color
  }
}

export interface AreaOfInterest {
  name: string
  bounds: LngLatBoundsLike
  icon: IconDefinition
}

export type MapStyle = 'road' | 'satellite' | 'road_satellite' | 'road_muted'
export type MapStyleProps = { name: string; url: { [key2 in PaletteType]: string } }

export type AuthConfig = {
  identity: {
    clientId: string
    audience: string
    scope: string
    claimNamespace: string
  }
}
