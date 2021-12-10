import { Dispatch } from 'redux'
import { ChecklistOption } from '../../components/ChecklistInput'
import { FilterActions } from './types'

const filterSelectionChanged = ({
  geographies,
  statuses
}: {
  geographies?: string[]
  statuses?: ChecklistOption<string>[]
}) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: FilterActions.SELECTION_CHANGED, geographies, statuses })
  }
}

const resetAllFilters = () => {
  return (dispatch: Dispatch) => {
    dispatch({ type: FilterActions.RESET_FILTERS })
  }
}

export const filterActions = {
  filterSelectionChanged,
  resetAllFilters
}
