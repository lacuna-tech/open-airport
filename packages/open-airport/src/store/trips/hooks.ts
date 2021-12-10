import { GetTripsOptions } from '@lacuna-core/mds-trip-backend'
import { Nullable } from 'lib'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from './actions'
import { selectors } from './selectors'

export const useTrips = (
  factory: () => { params: GetTripsOptions; link: Nullable<string> },
  deps: React.DependencyList
) => {
  const dispatch = useDispatch()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { params, link } = useMemo(factory, deps)

  const paramsDep = JSON.stringify(params)
  useEffect(() => {
    dispatch(actions.loadTrips(params, link))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, paramsDep, link])

  const state = useSelector(selectors.selectTripsState)

  const { data, loadState } = state || {}
  const { trips, links } = data || {}

  return { trips, links, loadState }
}
