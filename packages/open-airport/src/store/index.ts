/* eslint-disable import/no-cycle */
/**
 * Store domain
 */
import { createBrowserHistory } from 'history'
// Load domains created in the action/handlers pattern
import {
  createAppStore,
  auth,
  AuthReducerState,
  GeographyReducerState,
  geographies,
  serverConfig,
  ServerConfigReducerState,
  router,
  RouterReducerState,
  jurisdictionStore,
  JurisdictionsReducerState,
  metricsV2 as metrics,
  MetricReducerState,
  vehicleEvents,
  VehicleEventsReducerState
} from '@lacuna/ui-common'

import appStorage from './appStorage'
import { trayActions, traySelectors, reducer as trayReducer, TrayReducerState } from './tray'
import {
  actions as tripActions,
  selectors as tripSelectors,
  reducer as tripReducerMap,
  TripReducerState
} from './trips'
import { organizationConfigReducer } from './config'

export const actions = {
  ...router.actions,
  ...auth.actions,
  ...serverConfig.actions,
  ...jurisdictionStore.actions,
  ...geographies.actions,
  ...metrics.actions,
  ...vehicleEvents.actions,
  ...trayActions,
  ...tripActions
}

export const selectors = {
  ...auth.selectors,
  ...geographies.selectors,
  ...router.selectors,
  ...serverConfig.selectors,
  ...jurisdictionStore.selectors,
  ...metrics.selectors,
  ...vehicleEvents.selectors,
  ...traySelectors,
  ...tripSelectors
}

/**
 * Combine reducerMaps
 */
const reducerMap = {
  // NOTE: router is pulled in specially in `createAppStore`
  ...auth.reducerMap,
  ...geographies.reducerMap,
  ...serverConfig.reducerMap,
  ...jurisdictionStore.reducerMap,
  ...metrics.reducerMap,
  ...vehicleEvents.reducerMap,
  ...trayReducer,
  ...tripReducerMap,
  ...organizationConfigReducer
}

/**
 * Create full AppState as intersection of ReducerStates
 */
export type AppState = AuthReducerState &
  ServerConfigReducerState &
  GeographyReducerState &
  RouterReducerState &
  JurisdictionsReducerState &
  MetricReducerState &
  VehicleEventsReducerState &
  TrayReducerState &
  TripReducerState

// Create the store.
// Note that this is for the browser only -- create a different store for
export const history = createBrowserHistory()
const store = createAppStore<AppState>(reducerMap, history, appStorage, [])
export default store

export * from './config'

// re-export useful bits from ui-common
export { useBoundAction } from '@lacuna/ui-common'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.store = store
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.actions = actions
