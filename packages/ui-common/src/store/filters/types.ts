import { ChecklistOption } from '../../components/ChecklistInput'

export interface FilterState {
  geographies: string[]
  policyStatus: ChecklistOption<string>[]
}

export interface FilterReducerState {
  filterState: FilterState
}

export enum FilterActions {
  SELECTION_CHANGED = 'filter-selection-changed',
  RESET_FILTERS = 'filter-reset-all-filters'
}

export type FilterSelectionChangedAction = {
  type: FilterActions.SELECTION_CHANGED
  geographies?: string[]
  statuses?: ChecklistOption<string>[]
}

export type ResetAllFiltersAction = {
  type: FilterActions.RESET_FILTERS
}

export const getInitialFilterState: () => FilterState = () => ({
  geographies: [],
  policyStatus: []
})
