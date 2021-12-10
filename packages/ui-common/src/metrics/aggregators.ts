/**
 * Utility methods for dealing with metric types.
 */
import _min from 'lodash/min'
import _max from 'lodash/max'

import { IntegerMap, MetricValue, MetricAggregators, MetricValueAggregator } from './types'

function integerMapToArray(map: IntegerMap) {
  const values: number[] = []
  if (map) {
    Object.keys(map).forEach(strIndex => {
      const index = parseInt(strIndex, 10)
      values[index] = map[index]
    })
  }
  return values
}

const aggregators: { [key: string]: MetricValueAggregator } = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  none(values: MetricValue[]) {
    return null
  },

  /**
   * Return the `first` value of a list of Metric `values`.
   * For empty list, returns `null`.
   */
  first(values: MetricValue[]) {
    if (values.length > 0) return values[0]
    return null
  },

  /**
   * Return the `smallest` value of a list of Metric `values`.
   * For empty list, returns `null`.
   */
  smallest(values: MetricValue[]) {
    if (values.length > 0) {
      const min = _min(values)
      if (min !== undefined) return min
    }
    return null
  },

  /**
   * Return the `largest` value of a list of Metric `values`.
   * For empty list, returns `null`.
   */
  largest(values: MetricValue[]) {
    if (values.length > 0) {
      const max = _max(values)
      if (max !== undefined) return max
    }
    return null
  },

  /**
   * Return the `sum` of a list of numeric Metric `values`.
   * For empty list or if any values are not a number, returns `0`.
   */
  sum(values: MetricValue[]) {
    if (values.length === 0) return 0
    if (values.some(value => typeof value !== 'number')) return 0
    return (values as number[]).reduce((total, next) => total + next, 0)
  },

  /**
   * Return the `average` of a list of numeric Metric `values`.
   * For empty list or if any values are not a number, returns `0`.
   */
  average(values: MetricValue[]) {
    if (values.length === 0) return 0
    const sum = aggregators.sum(values)
    if (typeof sum === 'number') return sum / values.length
    return null
  },

  /**
   * Return the `sum` of a number of Metric `values` which are themselves sparse map of `{ number: number }`
   * as a sparse array. For empty map or if any values are not a number, returns empty array.
   */
  sumIntegerMaps(values: MetricValue[]) {
    if (!Array.isArray(values) || values.length === 0) return []
    const numArrays = ((values as unknown) as IntegerMap[]).map(integerMapToArray)
    const totals: number[] = []
    numArrays.forEach(numArray => {
      if (totals.length < numArray.length) {
        const start = totals.length
        totals.length = numArray.length
        totals.fill(0, start)
      }
      numArray.forEach((value, index) => {
        totals[index] += value || 0
      })
    })
    return totals
  },

  /**
   * Return the `average` of a number of Metric `values` which are themselves sparse arrays of numbers.
   * If any values are not an array, returns `null`.  ???
   * For empty list, returns empty array.
   */
  averageIntegerMaps(values: MetricValue[]) {
    if (values.length === 0) return []
    const sums = aggregators.sumIntegerMaps(values)
    if (!Array.isArray(sums)) return null
    return sums.map(value => {
      if (typeof value === 'number') return value / values.length
      return 0
    })
  }
}

/**
 * Aggregate a set of metric `values` according to `aggregator`.
 * Assumes all `values` are of same type or `null`.
 */
export function aggregateValues(values: MetricValue[], aggregator: MetricAggregators, precision: number): MetricValue {
  const value = typeof aggregator === 'function' ? aggregator(values) : aggregators[aggregator](values)
  if (typeof value === 'number') return parseFloat(value.toFixed(precision))
  if (Array.isArray(value)) {
    return value.map(item => (typeof item === 'number' ? parseFloat(item.toFixed(precision)) : item))
  }
  return value
}

/**
 * Given an array of MetricValue[], aggregate each item of the list.
 */
export function aggregateValueSets(valueSets: MetricValue[][], aggregator: MetricAggregators, precision: number) {
  return valueSets.map(values => aggregateValues(values, aggregator, precision))
}
