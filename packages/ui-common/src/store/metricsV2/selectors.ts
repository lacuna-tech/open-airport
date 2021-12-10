import { MetricReducerState } from './types'

type AppState = MetricReducerState

export const rootSelector = (state: AppState) => state

export const selectMetricState = (state: AppState) => state.metricState

export const selectors = {
  selectMetricState
}
