import { ChecklistOption } from '../../components/ChecklistInput'
import { FilterReducerState } from './types'

const selectGeographiesFilterState = (state: FilterReducerState): string[] => {
  return state.filterState.geographies
}

const selectPolicyStatusFilterState = (state: FilterReducerState): ChecklistOption<string>[] => {
  return state.filterState.policyStatus
}
export const filterSelectors = {
  selectGeographiesFilterState,
  selectPolicyStatusFilterState
}
