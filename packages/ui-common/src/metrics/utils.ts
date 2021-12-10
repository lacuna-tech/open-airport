/**
 * Utility methods for dealing with metric types.
 */
import keyBy from 'lodash/keyBy'

// eslint-disable-next-line import/no-cycle
import { Metric, RawMetrics, DerivedMetrics } from '.'

/**
 * Getters for Metrics objects.
 */

// internal map of all metrics, calculated once on demand in `getMetric()`.
let allMetricsMap: { [name: string]: Metric }

/** Return all RawMetrics and DerivedMetrics as a map by `metric.name`. */
export function getAllMetricsMap() {
  if (!allMetricsMap) allMetricsMap = keyBy([...RawMetrics, ...DerivedMetrics], 'name')
  return allMetricsMap
}

/** Return a single metric by name. Complains and returns `undefined if metric not found. */
export function getMetric(metricName: string) {
  const map = getAllMetricsMap()
  if (map[metricName] === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`getMetric(): couldn't find metric '${metricName}'`)
  }
  return allMetricsMap[metricName]
}

/** Return array of metrics by name. Complains and skips any metrics not found. */
export function getMetrics(...metricNames: string[]) {
  return metricNames.map(getMetric).filter(Boolean)
}

/**
 * Simulation utilties.
 */

/**
 * Return random integer between `min` and `max` inclusive.
 * If you pass a `multiplier`, we'll multiply the random value by that.
 *  e.g.  between(10)       => 0, 1, ..., 10
 *  e.g.  between(1,10)     => 1, ..., 10
 *  e.g.  between(2,5,100)  => 200, 300, 400, 500
 */
export function between(min: number, max?: number, options?: { multiplier?: number; round?: boolean }): number {
  if (typeof max !== 'number') return between(0, min, options)
  if (min > max) return between(max, min, options)
  const { multiplier = 1, round = true } = options || {}
  const value = (Math.random() * (max - min) + min) * multiplier
  return round ? Math.round(value) : value
}

/** Given a value, apply some jitter to it.  If undefined, will use defaultValue + jitter. */
export function jitter(value: number | undefined, defaultValue: number, jitterAmount = 0.05) {
  const valueToUse = value === undefined || Number.isNaN(value) ? defaultValue : value
  return between(valueToUse * (1 - jitterAmount), valueToUse * (1 + jitterAmount))
}

/**
 * Return a number, but only `percent` of the time.
 * Return a random number betwen `min` and `max` with `multiplier` ,
 * but only x `percent` of the time, otherwise return 0.
 */
export function chanceBetween(percent: number, min: number, max?: number, multiplier = 1) {
  if (between(0, 100) < percent) return 0
  return between(min, max, { multiplier })
}
