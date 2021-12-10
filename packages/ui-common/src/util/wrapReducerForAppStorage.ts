/**
 * Wrapper for your root store reducer to save `domainsToSave` in `appStorage` whenever reducer runs.
 * Note: not a middleware because we need to update state on initial load (which middleware can't do).
 *
 * `store_utils::createAppStore()` will take care of this for you.
 */
import { AnyAction } from 'redux'
import merge from 'lodash/merge'
import AppStorage from './AppStorage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function wrapReducerForAppStorage<State>(reducer: any, appStorage: AppStorage, domainsToSave: string[]) {
  let lastState: Record<string, unknown>
  return function wrappedReducer(state: State, action: AnyAction) {
    // Run the provided reducer FIRST
    let newState = reducer(state, action)
    // On initial run, lastState will be undefined
    // Re-hydrate last state by merging values from appStorage with newState
    if (!lastState) {
      newState = { ...newState }
      domainsToSave.forEach(domain => {
        const storedSlice = appStorage.get(domain) || {}
        if (storedSlice) {
          const initialSlice = newState[domain]
          newState[domain] = merge({}, initialSlice, storedSlice)
        }
      })
      lastState = newState
    }
    // Save specified domains in appStorage
    domainsToSave.forEach(domain => {
      const lastSlice = lastState && lastState[domain]
      const newSlice = newState[domain]
      if (lastSlice !== newSlice) appStorage.store(domain, newSlice)
    })
    return newState
  }
}
