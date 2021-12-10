import { TimeRangePreset } from '@lacuna/ui-common/src'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { UUID, VEHICLE_EVENT, VEHICLE_STATE_v1_1_0 } from '@mds-core/mds-types'
import { GEOFENCE_IDS } from 'lib/events'
import { SERVICE_TYPE, TRANSACTION_TYPE } from 'lib/trip'
import { Interval } from 'luxon'

export const SELECTABLE_FILTERS = [
  'vehicle_id',
  'time_range',
  'provider_id',
  'vehicle_event',
  'geography_id',
  'transaction_type',
  'service_type',
  'vehicle_state'
] as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SELECTABLE_FILTERS = typeof SELECTABLE_FILTERS[number]

export type BaseFilters = UUID[] | string | { start: MaterialUiPickersDate; end: MaterialUiPickersDate }

export type EventFilters = GEOFENCE_IDS[] | VEHICLE_EVENT[]

export type TripFilters = SERVICE_TYPE[] | TRANSACTION_TYPE[]

export type FilterState = Partial<{
  vehicle_id: string
  time_range: Interval | TimeRangePreset
  provider_id: UUID[]
  vehicle_event: VEHICLE_EVENT[]
  geography_id: UUID[]
  transaction_type: TRANSACTION_TYPE[]
  service_type: SERVICE_TYPE[]
  vehicle_state: VEHICLE_STATE_v1_1_0[]
}>
