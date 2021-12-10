import { AgencyKey, AirportDefinitionMap } from '@lacuna/agency-config'
import { DashboardData } from 'types'
import { UUID } from '@mds-core/mds-types'
import {
  GeographyMap,
  isJurisdiction,
  GeographyMetricAggregateMap,
  getMetricValue,
  MetricName,
  MetricAggregate
} from '@lacuna/ui-common'
import { Dimensions } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AirportChartData<T extends any> = Partial<{ [key in AgencyKey]: T }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProviderChartData<T extends any> = Partial<{ [key in UUID]: T }>

export interface DashboardChartProps {
  yesterdaysAggregate: MetricAggregate
  todaysAggregate: MetricAggregate
  dimensions: Dimensions
}

export interface DashboardChartDemoProps {
  airports: AirportDefinitionMap
  data: Partial<{ [key in AgencyKey]: DashboardData }>
  dimensions: Dimensions
}

export const buildSimpleChartData: (options: {
  name: MetricName
  aggregateMap: GeographyMetricAggregateMap
  geographyMap: GeographyMap
}) => AirportChartData<number> = ({ name, aggregateMap, geographyMap }) =>
  Object.keys(aggregateMap).reduce<AirportChartData<number>>((runningData, geography_id) => {
    if (geography_id in geographyMap) {
      const { entity } = geographyMap[geography_id]
      if (isJurisdiction(entity)) {
        const { agency_key } = entity
        const aggregate = aggregateMap[geography_id]
        return aggregate
          ? {
              ...runningData,
              [agency_key]: getMetricValue({ name, aggregate })
            }
          : runningData
      }
    }

    return runningData
  }, {})
