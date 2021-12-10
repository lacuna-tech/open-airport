import { Geography, UUID } from '@mds-core/mds-types'
import { createSelector } from 'reselect'
import { values } from 'lodash'
import { GeographyReducerState } from './types'

type AppState = GeographyReducerState

const selectGeographyState = (state: AppState) => state.geographyState

const selectGeography = (state: AppState, geographyId: UUID) => state.geographyState.geographyMap[geographyId]

const selectGeographies = createSelector(selectGeographyState, geographyState => values(geographyState.geographyMap))

const selectGeographiesActive = createSelector(selectGeographyState, () => {
  return [] as Geography[]
})

const selectGeographiesMap = (state: AppState) => state.geographyState.geographyMap

const selectGeographiesByIds = (state: AppState, geographyIds: UUID[]) => {
  const {
    geographyState: { geographyMap }
  } = state
  return geographyIds.map(geographyId => geographyMap[geographyId])
}

const selectGeographiesLoadState = (state: AppState) => state.geographyState.loaded

const selectGeographiesVisible = (state: AppState) => {
  const geos = selectGeographies(state)
  return geos.filter(geo => geo.geography_metadata?.visible_on_map)
}

export const selectors = {
  selectGeographyState,
  selectGeography,
  selectGeographies,
  selectGeographiesActive,
  selectGeographiesMap,
  selectGeographiesVisible,
  selectGeographiesByIds,
  selectGeographiesLoadState
}
