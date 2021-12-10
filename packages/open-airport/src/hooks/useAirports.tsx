import { useMemo } from 'react'
import { AirportConsoleConfig, AirportDefinitionMap, AgencyKey } from '@lacuna/agency-config'
import { LiteralKeys } from '@lacuna/ui-common'
import { selectors } from 'store'

const {
  apps: {
    airport: { airports }
  }
} = AirportConsoleConfig

/**
 * Returns the airports the user has access to
 */
export function useAirports(): AirportDefinitionMap {
  const jurisdictions = selectors.useJurisdictions()
  const agencies = selectors.useAgencies()

  return useMemo(
    () =>
      LiteralKeys<AgencyKey>(airports)
        .filter(key => {
          const jurisdiction = jurisdictions.find(j => j.agency_key === key)
          // Include if airport jurisdiction is in user jurisdictions
          return jurisdiction && agencies.includes(jurisdiction.agency_key)
        })
        .reduce<AirportDefinitionMap>((map, key) => {
          return { ...map, [key]: airports[key] }
        }, {}),
    [jurisdictions, agencies]
  )
}
