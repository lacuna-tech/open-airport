import { UUID, Geography } from '@mds-core/mds-types'
import { Geographical } from '../geography/types'

export interface Jurisdiction {
  jurisdiction_id: UUID
  agency_key: string
  agency_name: string
  geography_id: UUID
  geography: Geography
}

export const isJurisdiction = (obj: Geographical): obj is Jurisdiction => {
  return 'jurisdiction_id' in obj
}
