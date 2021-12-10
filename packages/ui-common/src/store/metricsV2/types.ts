import { EnumerableProps } from '../../util/types'
import { MetricAggregate, MetricsApiQuery, DimensionConstraints, DimensionValues } from '../../lib'
import { AuthReducerState } from '..'
import { LoadState } from '../../util/store_utils'

export interface MetricReducerState {
  metricState: MetricState
}

export type AppState = MetricReducerState & AuthReducerState

export interface MetricState {
  results: { [key: string]: MetricResult }
}

export interface MetricResult extends MetricRequest {
  aggregates: MetricAggregate[]
  loadState: LoadState
}

export interface MetricRequest {
  key: string
  query: MetricsApiQuery
  constraints?: DimensionConstraints
  dimensionValues: EnumerableProps<DimensionValues>
}

export const getInitialState: () => MetricState = () => ({
  results: {}
})

export const initialMetricResultState: (options: { request: Pick<MetricRequest, 'key' | 'query'> }) => MetricResult = ({
  request
}) => ({
  ...request,
  aggregates: [],
  loadState: LoadState.loading,
  constraints: undefined,
  dimensionValues: {}
})
