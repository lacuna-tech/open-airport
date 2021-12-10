import { Geography as GeographyCore, Nullable, UUID } from '@mds-core/mds-types'

export type Geography = GeographyCore

export type GeographyState = Geography | undefined | null

export const GeographyTypes = ['jurisdiction', 'stop', 'spot'] as const
export type GeographyType = typeof GeographyTypes[number]

export const GeographyTypeMap: { [key in GeographyType]: string } = {
  jurisdiction: 'Jurisdictions',
  stop: 'Terminals',
  spot: 'Zones'
}

export interface Geographical {
  geography_id: Nullable<UUID>
  geography: GeographyState
}

export interface GeographyMapEntry {
  entity: Geographical
  geography_type: GeographyType
  geography: Geography | undefined
}

export type GeographyMap = {
  [key in UUID]: GeographyMapEntry
}
