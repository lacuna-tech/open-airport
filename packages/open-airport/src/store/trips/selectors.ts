import { TripReducerState } from './types'

type AppState = TripReducerState

const selectTripsState = (state: AppState) => state.tripState

export const selectors = {
  selectTripsState
}
