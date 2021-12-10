import { TrayReducerState } from './types'

type AppState = TrayReducerState

export const selectEventTrayState = (state: AppState) => {
  return state.trayState.eventTray
}

export const selectTripTrayState = (state: AppState) => {
  return state.trayState.tripTray
}

export const traySelectors = {
  selectEventTrayState,
  selectTripTrayState
}
