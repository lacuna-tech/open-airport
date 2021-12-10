/**
 * Debugging sanity check:
 *  - warn if any DerivedMetric's name overrides a RawMetric name.
 *  - have each metric run a sanity check on itself
 * Prints any errors found to the console.
 */
/* eslint-disable no-console */
import intersection from 'lodash/intersection'
import map from 'lodash/map'

// eslint-disable-next-line import/no-cycle
import { RawMetrics, DerivedMetrics } from '.'

export function metricsSanityCheck() {
  let errors: string[] = []
  const baseKeys = map(RawMetrics, 'name')
  const userKeys = map(DerivedMetrics, 'name')
  const commonKeys = intersection(baseKeys, userKeys)
  if (commonKeys.length) {
    errors.push(`ERROR: metrics/definitions: DerivedMetrics name(s) override RawMetrics: ${commonKeys}`)
  }

  ;[...RawMetrics, ...DerivedMetrics].forEach(metric => {
    errors = errors.concat(metric.sanityCheck())
  })
  if (errors.length === 0) {
    // console.info('All Metrics pass sanity check!')
  } else {
    console.group('Found the following Metric setup errors:')
    errors.forEach(error => console.error(error))
    console.groupEnd()
  }
}
