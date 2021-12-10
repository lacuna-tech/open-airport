import { MetricAggregate } from './types'

export type SummaryHistoricalMetricInterval = 'PT1H' | 'P1D'
export type SummaryMetricKey = 'historicPrevious' | 'historic' | 'snapshot' | 'predicted'
export type SummaryMetricSet = { [key in SummaryMetricKey]: MetricAggregate[] }
