// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { geographies as geo, LoadState, jurisdictionStore } from '@lacuna/ui-common'
import { loadOrganizationsConfig } from 'store'
import { useAirport } from './useAirport'
import { useAirports } from './useAirports'
import { selectConfigLoadState } from '../store/config/selectors'

/*
  Use geographies with metadata, as returned from the /config/organizations endpoint
*/
export const useGeographiesWithMetadata = () => {
  const dispatch = useDispatch()
  const geoLoadState = useSelector(geo.selectors.selectGeographiesLoadState)
  const orgLoadState = useSelector(selectConfigLoadState)
  useEffect(() => {
    if (geoLoadState === LoadState.unloaded && orgLoadState === LoadState.unloaded) {
      dispatch(loadOrganizationsConfig())
    }
  }, [dispatch, geoLoadState, orgLoadState])

  const allGeographies = useSelector(geo.selectors.selectGeographies)

  // Bandaid solution until we address multi-airport / multi-jurisdiction in OA in general
  const airports = useAirports()
  const {
    airport: { agency_key }
  } = useAirport({ airports })
  const jurisdiction = jurisdictionStore.selectors.useJurisdictionByKey(agency_key)

  const geographies = React.useMemo(
    () =>
      allGeographies.filter(
        geography => geography.geography_metadata?.jurisdiction_id === jurisdiction?.jurisdiction_id
      ),
    [allGeographies, jurisdiction]
  )

  return geographies
}
