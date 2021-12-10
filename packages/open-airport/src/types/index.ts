import { AgencyKey } from '@lacuna/agency-config'

import { UUID } from '@mds-core/mds-types'
import { SummaryUtilization } from './custom-icons'

export interface DashboardData {
  dailyTrips: number
  curbUpgrades: number
  previousDailyTrips: number
  previousCurbUpgrades: number
  utilization: SummaryUtilization
  fees: number
  providers: { [key in UUID]: { provider_id: UUID; count: number } }
  avgWaitTime: number
  avgDwellTime: number
  violations: number
}

export type DashboardDataMap = { [key in AgencyKey]: DashboardData }

export interface SpotUtilization {
  airportName: string
  stopName: string
  spotName: string
  utilization: number
}
