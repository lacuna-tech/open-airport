import { createReducer } from '@reduxjs/toolkit'
import { LoadState } from '../../util'
import {
  VehicleEventActions,
  getInitialState,
  LoadVehicleEventsSuccessAction,
  LoadVehicleEventsAction,
  PushVehicleEventsAction
} from './types'

export const reducer = {
  vehicleEventsState: createReducer(getInitialState(), {
    [VehicleEventActions.LOAD_VEHICLE_EVENTS]: (state, action: LoadVehicleEventsAction) => {
      return {
        ...state,
        params: action.params,
        silent: action.silent,
        loadState: LoadState.loading
      }
    },
    [VehicleEventActions.LOAD_VEHICLE_EVENTS_SUCCESS]: (state, action: LoadVehicleEventsSuccessAction) => {
      return {
        ...state,
        loadState: LoadState.loaded,
        data: action.data
      }
    },
    [VehicleEventActions.LOAD_VEHICLE_EVENTS_FAILED]: state => {
      return {
        ...state,
        loadState: LoadState.error
      }
    },
    [VehicleEventActions.PUSH_VEHICLE_EVENTS]: (state, action: PushVehicleEventsAction) => {
      const existingEvents = state.data?.events || []
      return {
        ...state,
        loadState: LoadState.loaded,
        data: {
          events: [...existingEvents, ...action.newData.events],
          vehicles: { ...state.data?.vehicles, ...action.newData.vehicles },
          cursor: { ...action.newData.cursor }
        }
      }
    },
    [VehicleEventActions.RESET_VEHICLE_EVENTS]: () => {
      return {
        ...getInitialState()
      }
    }
  })
}
