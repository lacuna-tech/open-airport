import { createReducer } from '@reduxjs/toolkit'
import { keyBy, LoadState } from '../../util'
import {
  GeographiesActions,
  getInitialState,
  DeleteGeographyAction,
  RequestGeographiesSuccessAction,
  PushGeographiesAction
} from './types'

export const reducer = {
  geographyState: createReducer(getInitialState(), {
    reset: () => getInitialState(),
    [GeographiesActions.REQUEST_GEOGRAPHIES_STARTED]: state => ({ ...state, loaded: LoadState.loading }),
    [GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE]: state => ({ ...state, loaded: LoadState.error }),
    [GeographiesActions.REQUEST_GEOGRAPHIES_SUCCESS]: (state, action: RequestGeographiesSuccessAction) => {
      const {
        payload: { geographies }
      } = action

      // This assumes geography_id is not undefined
      const geographiesToAdd = keyBy(geographies, geography => geography.geography_id)

      return {
        ...state,
        loaded: LoadState.loaded,
        geographyMap: { ...state.geographyMap, ...geographiesToAdd }
      }
    },
    [GeographiesActions.DELETE_GEOGRAPHY]: (state, action: DeleteGeographyAction) => {
      const {
        payload: { geography_id }
      } = action
      const { [geography_id]: removed, ...geographyMap } = state.geographyMap

      return {
        ...state,
        loaded: LoadState.loaded,
        geographyMap
      }
    },
    [GeographiesActions.PUSH_GEOGRAPHIES]: (state, action: PushGeographiesAction) => {
      const { payload: geographies } = action
      const geographiesToAdd = keyBy(geographies, geography => geography.geography_id)
      return {
        ...state,
        loaded: LoadState.loaded,
        geographyMap: { ...state.geographyMap, ...geographiesToAdd }
      }
    }
  })
}
