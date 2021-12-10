import { useDispatch, useSelector } from 'react-redux'
import { ChecklistOption } from '../../components/ChecklistInput'
import { filterActions } from './actions'
import { filterSelectors } from './selectors'

export const useFilterState = () => {
  const dispatch = useDispatch()

  const updateFilters = ({
    geographies,
    statuses
  }: {
    geographies?: string[]
    statuses?: ChecklistOption<string>[]
  }) => {
    dispatch(filterActions.filterSelectionChanged({ geographies, statuses }))
  }

  const resetAllFilters = () => {
    dispatch(filterActions.resetAllFilters())
  }

  const useGeographiesFilterState = () => useSelector(filterSelectors.selectGeographiesFilterState)
  const selectedGeographies = useGeographiesFilterState()

  const usePolicyStatusFilterState = () => useSelector(filterSelectors.selectPolicyStatusFilterState)
  const selectedPolicyStatuses = usePolicyStatusFilterState()

  return { updateFilters, resetAllFilters, selectedGeographies, selectedPolicyStatuses }
}
