import React, { useCallback, useEffect, useMemo } from 'react'
import { useQueryParam, StringParam } from 'use-query-params'
import { AgencyKey, AirportDefinition, AirportDefinitionMap } from '@lacuna/agency-config'
import { useHistory } from 'react-router'
import { QueryString } from '@lacuna/ui-common'
import { useDispatch } from 'react-redux'

interface UseAirportProps {
  // The implicit airport chosen from query string. Falls back to first avilable airport if not set. This ensures there is always an airport in context.
  airport: AirportDefinition
  // The explcit airport from query string. Is undefined when not set. Comparing the explicit vs implicit gives components insight into a potential "all" state.
  explicitAirport: AirportDefinition | undefined
  setAirport: (key: AgencyKey) => void
  clearAirport: () => void
}

export function useAirport({ airports }: { airports: AirportDefinitionMap }): UseAirportProps {
  const history = useHistory()
  const firstAirport = Object.values(airports)[0]
  const dispatch = useDispatch()
  const [airportQueryParam] = useQueryParam('agency', StringParam)
  const [airport, setAirport] = React.useState(airportQueryParam ? airports[airportQueryParam] : firstAirport)
  const { agency_key } = airport ?? { agency_key: firstAirport.agency_key }

  const explicitAirport = useMemo(() => (airportQueryParam ? airports[airportQueryParam] : undefined), [
    airportQueryParam,
    airports
  ])

  useEffect(() => {
    if (!airportQueryParam && firstAirport !== airport) {
      // When the airport is cleared from the url, we should fall back to first airport but only if it wasn't already selected
      setAirport(firstAirport)
    } else if (airportQueryParam && airportQueryParam !== agency_key) {
      setAirport(airports[airportQueryParam])
    }
  }, [airports, airportQueryParam, agency_key, dispatch, firstAirport, airport])

  const handleAirportChanged = useCallback(
    (agency: AgencyKey) => {
      history.push(`${window.location.pathname}?${QueryString().set({ agency })}`)
    },
    [history]
  )

  const clearAirport = useCallback(() => {
    history.push(`${window.location.pathname}?${QueryString().remove('agency')}`)
  }, [history])

  return { airport, explicitAirport, setAirport: handleAirportChanged, clearAirport }
}
