import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from '@mds-core/mds-types'
import { findLowestCommonLoadState } from '../../util'
import { generateAggregates, MetricGeneratorProps, MetricsApiQuery } from '../../lib/metrics'
import { selectors } from './selectors'
import { actions } from './actions'
import { MetricRequest, initialMetricResultState, MetricResult } from './types'

export type MetricHookRequest = MetricRequest & {
  active: boolean
  // A random number used to help bust memoized cache
  salt: number
}

export const useMetricState = () => useSelector(selectors.selectMetricState)

export function useMetrics(factory: () => MetricHookRequest, deps: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const request = useMemo(factory, deps)
  const { key } = request
  const dispatch = useDispatch()

  useEffect(() => {
    const { active } = request
    if (active) {
      // Defer the dispatching the loadMetrics until all the filters have values. This is a way to
      // prevent spamming the metrics calls while upstream and latent data takes shape.
      // E.g., Terminal Summary fetches stops, spot, and jurisdictions to build the geographies filter.
      // No need to repeatily call into loading of metrics during that process. The key is defering the
      // specifying of filter values until all the necessary data has been gathered.
      dispatch(actions.loadMetrics({ request }))
    }
  }, [dispatch, request])

  const { results } = useMetricState()

  // State is needed to preserve memoization of the selected result by key.
  const [metricResult, setMetricResult] = useState<{ request: MetricHookRequest; result: MetricResult }>({
    request,
    result: initialMetricResultState({ request })
  })

  useEffect(() => {
    const { result } = metricResult
    if (key in results && results[key] !== result) {
      setMetricResult({ request, result: results[key] })
    }
  }, [key, metricResult, request, results])

  return metricResult
}

export function useGeneratedMetrics(
  factory: () => MetricHookRequest & MetricGeneratorProps,
  deps?: React.DependencyList
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const request = useMemo(factory, deps)
  const { key, query, valueGenerator, constraints } = request
  const dispatch = useDispatch()

  useEffect(() => {
    const { active } = request
    if (active) {
      const aggregates = generateAggregates({ query, valueGenerator, constraints })
      dispatch(actions.setMetrics({ request, aggregates }))
    }
  }, [dispatch, key, query, request, constraints, valueGenerator])

  const { results } = useMetricState()

  const [metricResult, setMetricResult] = useState<{ result: MetricResult }>({
    result: initialMetricResultState({ request })
  })

  useEffect(() => {
    const { result } = metricResult
    if (key in results && results[key] !== result) {
      setMetricResult({ result: results[key] })
    }
  }, [key, metricResult, results])

  return metricResult
}

type MetricTimeTupleHookRequest = Omit<MetricRequest, 'query'> & {
  query: Omit<MetricsApiQuery, 'start_date' | 'end_date'> & {
    previousTimeRange: {
      start_date?: Timestamp
      end_date?: Timestamp
    }
    currentTimeRange: {
      start_date?: Timestamp
      end_date?: Timestamp
    }
  }
  active: boolean
  // A random number used to help bust memoized cache
  salt: number
}

/**
 * A useMetrics wrapper that helps marshal fetching metrics for multiple points of time metrics.
 * E.g., Today vs Yesterday, or this hour vs same hour yesterday, etc.
 * */
export function useMetricsTuple(factory: () => MetricTimeTupleHookRequest, deps: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const request = useMemo(factory, deps)

  const { result: previous } = useMetrics(() => {
    const {
      query: { previousTimeRange, currentTimeRange, ...queryMain }
    } = request

    return { ...request, key: `${request.key}-previous`, query: { ...queryMain, ...previousTimeRange } }
  }, [request])

  const { result: current } = useMetrics(() => {
    const {
      query: { previousTimeRange, currentTimeRange, ...queryMain }
    } = request

    return { ...request, key: `${request.key}-current`, query: { ...queryMain, ...currentTimeRange } }
  }, [request])

  return useMemo(
    () => ({
      previous,
      current,
      loadState: findLowestCommonLoadState(previous.loadState, current.loadState)
    }),
    [current, previous]
  )
}
