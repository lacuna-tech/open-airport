/**
 * Metrics store.
 * Note that the actual metrics data is very very large and is not placed into redux!
 * TODO: move into ui-common?
 */
/* eslint-disable no-console */

import isEqual from 'lodash/isEqual'
import { useSelector } from 'react-redux'

import { MetricSet } from '../../metrics'
import { fetchMetrics, fetchMetricsOld } from '../../service/mds-metrics/mds-metrics'
import type { FetchMetricsParamsOld, MetricsApiQuerySpecification } from '../../service/mds-metrics/mds-metrics'

import { selectors as authSelectors } from '../auth/auth'
import { createReducer, ThunkedPromise, ReducerMap, LoadState } from '../../util/store_utils'

export type { FetchMetricsParamsOld }

/**
 * STATE OUTSIDE OF REDUX
 */

/** Cached metrics stored outside of redux, grouped by geography_id.
 *  Selectors will pull out specific bits as needed, but we often just want everything.
 */
const METRICS_CACHE: { [key: string]: MetricSet } = {}

/**
 * Domain state shape
 */
export interface MetricsState {
  /** Map of providers for whom we have already loaded weekly metrics. */
  loadedMetrics: {
    [key: string]: {
      loadState: LoadState
      params?: FetchMetricsParamsOld
    }
  }
}

// Initial domain state.
function getInitialState(): MetricsState {
  return {
    loadedMetrics: {}
  }
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface MetricsReducerState {
  metrics: MetricsState
}

/**
 * Selectors and hooks
 */
const selectors = {
  /** Returns entire domain state. */
  metricsState(state: MetricsReducerState) {
    return state.metrics
  },
  /** Hook to get entire domain state. */
  useMetricsState() {
    return useSelector(selectors.metricsState)
  },
  /** Return load state map for metrics `key` or `params`. */
  metricsLoadState(state: MetricsReducerState, key: string) {
    const { loadedMetrics } = selectors.metricsState(state)
    return loadedMetrics[key] || { loadState: LoadState.unloaded }
  },
  /** Return load state map for metrics `key` or `params`. */
  useMetricsLoadState(key: string) {
    const { loadedMetrics } = selectors.useMetricsState()
    return loadedMetrics[key] || { loadState: LoadState.unloaded }
  },
  /** Return metrics loaded under particular `key` or specific `params`.  */
  useMetrics(
    key: string
  ): { loadState: LoadState; metrics: MetricSet | undefined; params: FetchMetricsParamsOld | undefined } {
    const { loadState, params } = this.useMetricsLoadState(key)
    const metrics = METRICS_CACHE[key]
    return { loadState, metrics, params }
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<MetricsState> = {}

/** Generic handler to just update state, e.g. when mucking with non-redux stuff. */
handlers.updateMetricsState = state => ({ ...state })

/** Update loadedMetricsForProviders for specified providers */
handlers.updateMetricsLoadState = (state, { payload: { key, params, loadState } }) => {
  const loadedMetrics = { ...state.loadedMetrics }
  return {
    ...state,
    loadedMetrics: {
      ...loadedMetrics,
      [key]: { loadState, params }
    }
  }
}

/**
 * Old Load metrics for `params`, caching under `key`.
 * Pass `{ forceReload: true }` to skip cache check.
 * ASSUMES: this will only be called when `params` actually change (e.g. in a `useEffect()`)
 * TODO: build param value checking into cache...
 */
function loadMetricsOld({
  key,
  params,
  forceReload = false
}: {
  key: string
  params: FetchMetricsParamsOld
  forceReload?: boolean
}): ThunkedPromise<undefined> {
  return async (dispatch, getState) => {
    // We will have a race condition if this routine is called with different parameters and the same key.
    // After fetching, we only continue if params passed in match current state.
    function parametersMatchLastLoad() {
      const { params: latestParams } = selectors.metricsLoadState(getState(), key)
      const paramsMatch = isEqual(params, latestParams)
      if (!paramsMatch) {
        console.warn('Loaded metrics for:', params, "when we think we're loading:", latestParams)
      }
      return paramsMatch
    }

    const { loadState = LoadState.unloaded, params: lastLoadParams } = selectors.metricsLoadState(getState(), key)
    // if we don't want to force reload and params are the same:
    if (loadState !== LoadState.unloaded && !forceReload && isEqual(lastLoadParams, params)) {
      // Just tickle redux so we'll redraw
      console.info('Using cached metrics:', { key, loadState, params })
      dispatch({ type: 'updateMetricsState' })
      return
    }
    // If already loading, or load error, return undefined
    console.info('Loading metrics:', { key, params })
    delete METRICS_CACHE[key]
    dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.loading } })
    const authToken = authSelectors.authToken(getState())
    try {
      const metrics = await fetchMetricsOld({ authToken, params })

      // Check race condition before continuing!
      if (!parametersMatchLastLoad()) return
      METRICS_CACHE[key] = metrics
      dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.loaded } })
    } catch (e) {
      // Check race condition before continuing!
      if (!parametersMatchLastLoad()) return
      dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.error } })
    }
  }
}

/**
 * Load metrics for `params`, caching under `key`.
 * Pass `{ forceReload: true }` to skip cache check.
 * ASSUMES: this will only be called when `params` actually change (e.g. in a `useEffect()`)
 * TODO: build param value checking into cache...
 */
function loadMetrics({
  key,
  params,
  forceReload = false
}: {
  key: string
  params: MetricsApiQuerySpecification
  forceReload?: boolean
}): ThunkedPromise<undefined> {
  return async (dispatch, getState) => {
    // We will have a race condition if this routine is called
    // with different parameters and the same key.
    // After fetching, we only continue if params passed in match curent state.
    function parametersMatchLastLoad() {
      const { params: latestParams } = selectors.metricsLoadState(getState(), key)
      const paramsMatch = isEqual(params, latestParams)
      if (!paramsMatch) {
        console.warn('Loaded metrics for:', params, "when we think we're loading:", latestParams)
      }
      return paramsMatch
    }

    const { loadState = LoadState.unloaded, params: lastLoadParams } = selectors.metricsLoadState(getState(), key)
    // if we don't want to force reload and params are the same:
    if (loadState !== LoadState.unloaded && !forceReload && isEqual(lastLoadParams, params)) {
      // Just tickle redux so we'll redraw
      console.info('Using cached metrics:', { key, loadState, params })
      dispatch({ type: 'updateMetricsState' })
      return
    }
    // If already loading, or load error, return undefined
    console.info('Loading metrics:', { key, params })
    delete METRICS_CACHE[key]
    dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.loading } })
    const authToken = authSelectors.authToken(getState())
    try {
      const metricSet = await fetchMetrics({ authToken, params })

      // Check race condition before continuing!
      if (!parametersMatchLastLoad()) return
      METRICS_CACHE[key] = metricSet
      dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.loaded } })
    } catch (e) {
      // Check race condition before continuing!
      if (!parametersMatchLastLoad()) return
      dispatch({ type: 'updateMetricsLoadState', payload: { key, params, loadState: LoadState.error } })
    }
  }
}

function unloadMetrics(key: string) {
  delete METRICS_CACHE[key]
  return { type: 'updateMetricsLoadState', payload: { key, loadState: LoadState.unloaded } }
}

// Group domain actions for export (necessary so actions are typed)
const actions = {
  loadMetrics,
  loadMetricsOld,
  unloadMetrics
}

// `reducerMap` used to create reducer for this store.
const reducerMap = {
  metrics: createReducer<MetricsState>(handlers, getInitialState())
}

export default { actions, selectors, reducerMap, getInitialState }
