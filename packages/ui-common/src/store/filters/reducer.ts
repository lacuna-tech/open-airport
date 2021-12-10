import { createReducer } from '@reduxjs/toolkit'
import { FilterActions, FilterSelectionChangedAction, getInitialFilterState } from './types'

export const filterReducer = {
  filterState: createReducer(getInitialFilterState(), {
    [FilterActions.SELECTION_CHANGED]: (state, action: FilterSelectionChangedAction) => {
      return {
        ...state,
        geographies: action.geographies || state.geographies,
        policyStatus: action.statuses || state.policyStatus
      }
    },
    [FilterActions.RESET_FILTERS]: () => {
      return {
        ...getInitialFilterState()
      }
    }
  })
}
