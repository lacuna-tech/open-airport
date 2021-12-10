import { ThunkAction } from 'redux-thunk'
import FileSaver from 'file-saver'
import { selectors as authSelectors } from '../auth/auth'
import notifier from '../notifier/notifier'
import { defragmentMetrics, MetricAggregate } from '../../lib'
import { AppState, MetricRequest } from './types'
import { fetchMetrics, fetchMetricsCsv } from './service'

export type ResetAction = { type: 'reset' }

export type LoadMetricsAction = { type: 'load-metrics'; payload: Pick<MetricRequest, 'key' | 'query'> }
export type LoadMetricsFailureAction = { type: 'load-metrics-failure'; payload: Pick<MetricRequest, 'key' | 'query'> }
export type LoadMetricsSuccessAction = {
  type: 'load-metrics-success'
  payload: Pick<MetricRequest, 'key' | 'query'> & { aggregates: MetricAggregate[] }
}

type Action = ResetAction | LoadMetricsAction | LoadMetricsSuccessAction | LoadMetricsFailureAction

function reset(): Action {
  return {
    type: 'reset'
  }
}

function setMetrics({
  request: { key, query },
  aggregates
}: {
  request: MetricRequest
  aggregates: MetricAggregate[]
}): ThunkAction<void, AppState, unknown, Action> {
  return async dispatch => {
    await dispatch({
      type: 'load-metrics-success',
      payload: { key, query, aggregates }
    })
  }
}

function loadMetrics({
  request,
  request: { key, query, constraints, dimensionValues }
}: {
  request: MetricRequest
}): ThunkAction<void, AppState, unknown, Action> {
  return async (dispatch, getState) => {
    await dispatch({ type: 'load-metrics', payload: { key, query } })
    const authToken = authSelectors.authToken(getState())
    try {
      const aggregates = await fetchMetrics({ authToken, query })
      const defragmentedAggregates = defragmentMetrics({ query, aggregates, constraints, dimensionValues })
      await dispatch(setMetrics({ request, aggregates: defragmentedAggregates }))
    } catch (e) {
      await dispatch({ type: 'load-metrics-failure', payload: { key, query } })
      await dispatch(notifier.actions.displayError('Error loading metrics:', e))
    }
  }
}

function loadMetricsCsv({
  request: { query }
}: {
  request: MetricRequest
}): ThunkAction<void, AppState, unknown, Action> {
  return async (dispatch, getState) => {
    const authToken = authSelectors.authToken(getState())
    try {
      const { blob, filename } = await fetchMetricsCsv({ authToken, query })
      FileSaver.saveAs(blob, filename)
    } catch (e) {
      await dispatch(notifier.actions.displayError('Error loading metrics csv: ', e))
    }
  }
}

export const actions = {
  reset,
  setMetrics,
  loadMetrics,
  loadMetricsCsv
}
