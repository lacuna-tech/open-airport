import { useSelector, useDispatch } from 'react-redux'
import { UUID } from '@mds-core/mds-types'
import { useEffect } from 'react'
import { selectors } from './selectors'

import { actions } from './actions'
import { GeographyReducerState } from './types'
import { defined } from '../../util'

const useGeography = (geographyId?: UUID) =>
  useSelector((state: GeographyReducerState) => {
    return geographyId ? selectors.selectGeography(state, geographyId) : undefined
  })

const useGeographiesList = () => useSelector(selectors.selectGeographies)

const useActiveGeographyList = () => useSelector(selectors.selectGeographiesActive)

/**
 * Intialize geographies with loading and error states
 * @returns List of geographies, load state, error
 */
export const useGeographies = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getGeographies())
  }, [dispatch])

  const geographies = useGeographiesList()
  const loadState = useSelector(selectors.selectGeographiesLoadState)

  return { geographies, loadState }
}

export const useGeographiesById = (geography_ids: UUID[]) =>
  useSelector((state: GeographyReducerState) => {
    return defined(selectors.selectGeographiesByIds(state, geography_ids))
  })

export const hooks = {
  useGeographiesList,
  useActiveGeographyList,
  useGeographies,
  useGeographiesById,
  useGeography
}
