import { UUID } from '@mds-core/mds-types'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { PolicyComplianceQuery_providersActive } from '../../pages/policy/PolicyCompliancePage/__generated__/PolicyComplianceQuery'
import {
  groupAndAggregateMetrics,
  groupMetricsByDimension,
  MetricAggregate,
  MetricName,
  MetricsApiQuery,
  sortMetrics
} from '../../lib/metrics'
import { MetricsMultilineChartData, MultilineChart } from './MultilineChart'
import { Dimensions } from './types'

export const ProviderMultilChart = ({
  query: { interval },
  aggregates,
  dimensions,
  providers,
  measures,
  useLeftLegend,
  disableLegend
}: {
  query: MetricsApiQuery
  aggregates: MetricAggregate[]
  dimensions: Dimensions
  measures: MetricName[]
  providers: PolicyComplianceQuery_providersActive[] | undefined
  useLeftLegend?: boolean
  disableLegend?: boolean
}) => {
  const data = useMemo(() => {
    const providerGroupedAggregates = groupMetricsByDimension({ aggregates, dimension: 'provider_id' })
    const provider_ids = providers?.map(p => p.provider_id) || []

    const dataScaffolding = Object.entries(providerGroupedAggregates)
      .sort(([provider_id_1]) => -provider_ids.indexOf(provider_id_1))
      .reduce<{ [key in UUID]: MetricsMultilineChartData }>((accumulation, [provider_id, providerAggregates]) => {
        const provider = providers ? providers.find(p => p.provider_id === provider_id) : undefined
        return {
          ...accumulation,
          [provider_id]: {
            id: provider?.provider_name || 'Unknown',
            data: sortMetrics(
              groupAndAggregateMetrics(providerAggregates, aggregate => aggregate.time_bin_start),
              aggregate => aggregate.time_bin_start
            ).map(aggregate => ({
              x: DateTime.fromMillis(aggregate.time_bin_start).toJSDate(),
              y: measures.map(measure => aggregate.measures[measure] || 0).reduce((acc, curr) => acc + curr)
            })),
            color: provider?.color || undefined
          }
        }
      }, {})

    return Object.values(dataScaffolding)
  }, [aggregates, providers, measures])

  return <MultilineChart {...{ data, dimensions, useLeftLegend, xAxisInterval: interval, disableLegend }} />
}
