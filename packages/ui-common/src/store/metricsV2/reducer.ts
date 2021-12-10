import { createReducer } from '@reduxjs/toolkit'
import { LoadState } from '../../util/store_utils'
import { getInitialState, MetricState, initialMetricResultState } from './types'
import { LoadMetricsSuccessAction, LoadMetricsAction, LoadMetricsFailureAction } from './actions'

export const reducer = {
  metricState: createReducer(getInitialState(), {
    reset: () => getInitialState(),
    'load-metrics': (state: MetricState, action: LoadMetricsAction) => {
      const {
        payload: request,
        payload: { key }
      } = action
      const { results } = state
      return {
        ...state,
        results: {
          ...results,
          [key]: initialMetricResultState({ request })
        }
      }
    },
    'load-metrics-failure': (state: MetricState, action: LoadMetricsFailureAction) => {
      const {
        payload: { key }
      } = action
      const { results } = state
      const result = results[key]
      return {
        ...state,
        results: {
          ...results,
          [key]: { ...result, loadState: LoadState.error }
        }
      }
    },
    'load-metrics-success': (state: MetricState, action: LoadMetricsSuccessAction) => {
      const {
        payload: { key, aggregates }
      } = action
      const { results } = state
      const result = results[key]
      return {
        ...state,
        results: {
          ...results,
          [key]: { ...result, aggregates, loadState: LoadState.loaded }
        }
      }
    }
  })
}
