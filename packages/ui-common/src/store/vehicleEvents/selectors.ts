import { createSelector } from 'reselect'
import { VehicleEventsReducerState, VehicleEventsState } from './types'

type AppState = VehicleEventsReducerState

const selectVehicleEventsState = (state: AppState): VehicleEventsState => {
  return state.vehicleEventsState
}

const selectVehicleEvents = createSelector(selectVehicleEventsState, eventsState => eventsState.data?.events)

export const selectors = {
  selectVehicleEventsState,
  selectVehicleEvents
}
