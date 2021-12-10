import { Nullable } from '@mds-core/mds-types'
import {
  DeviceDomainModel,
  EventAnnotationDomainModel,
  EventDomainModel,
  GetVehicleEventsFilterParams as FilterParams
} from '@mds-core/mds-ingest-service'

import { AuthReducerState } from '../auth/auth'
import { LoadState } from '../../util'

export type GetVehicleEventsFilterParams = FilterParams & {
  format?: 'json' | 'csv'
}

export type VehicleEventType = EventDomainModel

export type VehicleEventsResponse = {
  events: (EventDomainModel & {
    annotation: Nullable<EventAnnotationDomainModel>
  })[]
  vehicles: Partial<{
    UUID: DeviceDomainModel
  }>
  cursor: {
    prev: Nullable<string>
    next: Nullable<string>
  }
}

export interface VehicleEventsState {
  loadState: LoadState
  silent?: boolean
  params?: GetVehicleEventsFilterParams
  data?: VehicleEventsResponse
}

// EventDomainModel does not have an id field, but some features in OA require referencing unique events
export const getEventId = (event: VehicleEventType): string => `${event.device_id}-${event.timestamp}`

export interface VehicleEventsReducerState {
  vehicleEventsState: VehicleEventsState
}

export type AppState = VehicleEventsReducerState & AuthReducerState

export const GROUPING_TYPES = ['latest_per_vehicle', 'latest_per_trip', 'all_events'] as const
export type GROUPING_TYPE = typeof GROUPING_TYPES[number]

export const ApiQueryResponseFormats = ['json', 'csv'] as const
export type ApiQueryResponseFormat = typeof ApiQueryResponseFormats[number]

export const VEHICLE_STATUSES = [
  'available',
  'reserved',
  'unavailable',
  'removed',
  'inactive',
  'trip',
  'elsewhere'
] as const
export type VEHICLE_STATUS = typeof VEHICLE_STATUSES[number]

export enum VehicleEventActions {
  LOAD_VEHICLE_EVENTS = 'load-vehicle-events',
  LOAD_VEHICLE_EVENTS_FAILED = 'load-vehicle-events-failed',
  LOAD_VEHICLE_EVENTS_SUCCESS = 'load-vehicle-events-success',
  PUSH_VEHICLE_EVENTS = 'push-vehicle-events',
  RESET_VEHICLE_EVENTS = 'reset-vehicle-events'
}

export type LoadVehicleEventsAction = {
  type: VehicleEventActions.LOAD_VEHICLE_EVENTS
  silent?: boolean
  params: GetVehicleEventsFilterParams
}

export type LoadVehicleEventsFailedAction = { type: VehicleEventActions.LOAD_VEHICLE_EVENTS_FAILED }
export type LoadVehicleEventsSuccessAction = {
  type: VehicleEventActions.LOAD_VEHICLE_EVENTS_SUCCESS
  data: VehicleEventsResponse
}

export type PushVehicleEventsAction = {
  type: VehicleEventActions.PUSH_VEHICLE_EVENTS
  newData: VehicleEventsResponse
}

export type RequestVehicleEventsActions =
  | LoadVehicleEventsAction
  | LoadVehicleEventsFailedAction
  | LoadVehicleEventsSuccessAction

export const getInitialState: () => VehicleEventsState = () => ({
  loadState: LoadState.unloaded,
  params: undefined,
  silent: undefined,
  data: { events: [], vehicles: {}, cursor: { prev: null, next: null } }
})
