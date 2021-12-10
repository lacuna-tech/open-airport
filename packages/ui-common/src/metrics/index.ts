/* eslint-disable import/no-cycle */
/* eslint-disable no-console */

import { metricsSanityCheck } from './metricsSanityCheck'

export * from './types'
export * from './MetricSet'
export * from './Metric'
export * from './MetricDataSet'
export * from './aggregators'
export * from './RandomMetricSlice'
export * from './RandomMetricHour'
export * from './RandomMetricDay'
export * from './RandomMetricWeek'
export * from './RawMetrics'
export * from './DerivedMetrics'
export * from './utils'
export * from './datetime-helper'

/** DEV ONLY: Run metricsSanityCheck() which logs errors in metrics setup. */
if (process.env.NODE_ENV === 'development') metricsSanityCheck()
