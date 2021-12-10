import { GetTripsOptions, TripDomainModel } from '@lacuna-core/mds-trip-backend'
import { AuthReducerState, LoadState } from '@lacuna/ui-common'
import { Nullable } from 'lib'

export enum TripActions {
  LOAD_TRIPS = 'load-trips',
  LOAD_TRIPS_FAILED = 'load-trips-failed',
  LOAD_TRIPS_SUCCESS = 'load-trips-success'
}

export type GetTripsApiResult = { trips: TripDomainModel[]; links: { prev: Nullable<string>; next: Nullable<string> } }

export type LoadTripsAction = { type: TripActions.LOAD_TRIPS; params: GetTripsOptions }
export type LoadTripsFailedAction = { type: TripActions.LOAD_TRIPS_FAILED }
export type LoadTripsSuccessAction = { type: TripActions.LOAD_TRIPS_SUCCESS; data: GetTripsApiResult }

export type RequestTripActions = LoadTripsAction | LoadTripsFailedAction | LoadTripsSuccessAction
export interface TripState {
  loadState: LoadState
  data: GetTripsApiResult
}

export interface TripReducerState {
  tripState: TripState
}

export type AppState = TripReducerState & AuthReducerState
export const getInitialState: () => TripState = () => ({
  loadState: LoadState.unloaded,
  data: { trips: [], links: { prev: null, next: null } }
})
