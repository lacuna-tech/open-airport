/**
 * Sample domain to illustrate action/handlers pattern:
 */
import { useSelector } from 'react-redux'
import { createReducer, Action, ThunkedAction, ThunkedPromise, ReducerMap } from '../../util/store_utils'

/**
 * GENERIC FUNCTION: Add asynchronous "sleep" of delay msec
 * @param delay Delay in milliseconds
 */
function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Domain state shape:
 * Map of `{ <counterName>: <counterValue> }`
 */
export interface CountersState {
  [counterName: string]: number
}

// Initial domain state.
function getInitialState(): CountersState {
  return {}
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface CountersReducerState {
  counters: CountersState
}

/**
 * Selectors and `useX` methods for hooks
 */
export const selectors = {
  // Get counter state
  counters(state: CountersReducerState) {
    return state.counters
  },
  useCounters() {
    return useSelector(selectors.counters)
  },
  // Return state for a single named counter
  counter(state: CountersReducerState, name: string) {
    return selectors.counters(state)[name]
  },
  useCounter(name: string) {
    return selectors.useCounters()[name]
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<CountersState> = {}

/**
 * Set named counter to some value
 */
function setCounter(name: string, value: number): Action {
  return { type: 'setCounter', payload: { name, value } }
}
handlers.setCounter = (state, { payload: { name, value } }) => {
  return {
    ...state,
    [name]: value
  }
}

/**
 * Reset some counter to 0
 */
function resetCounter(name: string): Action {
  // re-use action handler defined above
  return setCounter(name, 0)
}

/**
 * Increment counter by some amount.  Uses `getState` to get the current state value.
 */
function incrementCounter(name: string, amount = 1): ThunkedAction {
  return (dispatch, getState) => {
    // use `selectors.counter` to get the current state
    const value = selectors.counter(getState(), name) || 0
    dispatch(setCounter(name, value + amount))
  }
}

/**
 * Increment counter after a little while (just to show async pattern)
 */
function incrementCounterSoon(name: string, amount = 1): ThunkedPromise<void> {
  return async dispatch => {
    // simulate an asynch process
    await sleep(1000)
    dispatch(incrementCounter(name, amount))
  }
}

// Group domain actions for export (necessary so actions are typed)
export const actions = {
  resetCounter,
  incrementCounter,
  incrementCounterSoon
}

// `reducerMap` used to create reducer for this store.
export const reducerMap = { counters: createReducer<CountersState>(handlers, getInitialState()) }

export default { actions, selectors, reducerMap }
