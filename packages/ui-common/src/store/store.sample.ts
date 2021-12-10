/**
 * Example of how to create a redux store together by stitching together
 * a number of redux `domains`
 */
import { createBrowserHistory } from 'history'
import { createAppStore } from '../util/store_utils'

// Load domains created in the action/handlers pattern
import { auth, AuthReducerState, router, RouterReducerState } from '.'

export const actions = {
  ...router.actions,
  ...auth.actions
}

export const selectors = {
  ...auth.selectors,
  ...router.selectors
}

/**
 * Combine reducerMaps
 */
const reducerMap = {
  // NOTE: router is pulled in specially in `createAppStore`
  ...auth.reducerMap
}

/**
 * Create full AppState as intersection of ReducerStates
 */
export type AppState = AuthReducerState & RouterReducerState

// Create the store.
// Note that this is for the browser only -- create a different store for
const store = createAppStore<AppState>(reducerMap, createBrowserHistory())
export default store
