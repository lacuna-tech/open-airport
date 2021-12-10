/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Store utilities for managing redux / typescript
 * Assumes use of `react-router`/`connected-react-router` and `redux-thunk`.
 */
import { History } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { applyMiddleware, combineReducers, compose, createStore, CombinedState, Store } from 'redux'
import thunk, { ThunkDispatch } from 'redux-thunk'
import { createLogger } from 'redux-logger'

// localStorage shim
import AppStorage from './AppStorage'
import wrapReducerForAppStorage from './wrapReducerForAppStorage'

// Define `__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` on window (for createAppStore)
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any
  }
}

/**
 * Generic Interfaces
 */

// Generic loadState enumeration.
export enum LoadState {
  unloaded = 'unloaded',
  loading = 'loading',
  loaded = 'loaded',
  error = 'error'
}

const LoadStates = [LoadState.error, LoadState.loading, LoadState.loaded]
export const findLowestCommonLoadState = (...loadStates: LoadState[]) =>
  LoadStates[Math.min(...loadStates.map(loadState => LoadStates.indexOf(loadState)))]

// Single action in Flux Standard Action type.
// All actions should conform to this.
export interface Action {
  type: any
  payload?: any
  error?: boolean
  meta?: any
}

// Return type for a synchronous redux-thunk action creator.
// You can return an Action or nothing.
// e.g.
//    export function doTheThing(param: string): ThunkedAction {
//      return (dispatch, getState) => {
//        if (getState().foo.bar) {
//          return dispatch({ type: "someAction" })
//        }
//      }
//    }
// NOTE: this is compatible with `ThunkAction` from `redux-thunk/index.d.ts`
export type ThunkedAction = (dispatch: ThunkDispatch<any, undefined, Action>, getState: () => any) => Action | void

// Return type for an async redux-thunk action creator.
// `ReturnType` is what is returned from the promise (use `void` if nothing returned).
// e.g.
//    export function doTheThing(param: string): ThunkedPromise<string> {
//      return async (dispatch, getState) => {
//        return await doAsyncThingWhichReturnsAString(param)
//      }
//    }
// NOTE: this is compatible with `ThunkAction` from `redux-thunk/index.d.ts`
export type ThunkedPromise<ReturnType, StateType = any, ActionType extends Action = Action> = (
  dispatch: ThunkDispatch<StateType, undefined, ActionType>,
  getState: () => StateType
) => Promise<ReturnType | void>

// Generic action creator function which returns an Action or an ActionDispatcher function
export interface ActionCreator {
  (...args: any[]): Action | ThunkedAction | ThunkedPromise<any> | undefined
}

// Map of action creators
export interface ActionCreatorMap {
  [selector: string]: ActionCreator
}

// Reducer tied to a particular state shape
export interface Reducer<State> {
  (state: State, action: Action): State
}
// Map of Reducers tied to a particular state shape
export interface ReducerMap<State> {
  [actionName: string]: Reducer<State>
}

// Map of selectors
export interface SelectorMap {
  [selector: string]: (...args: any[]) => any
}

/**
 * Create a reducer function for a single store domain.
 *
 * @param handlers Map of `{ actionName: <domain reducer for that action> }`
 * @param initialState Initial state for this domain.
 * @param localStorageKey Localstorage key for domain state.
 * If passed, domain state will be serialized on write and merged with `initialState` on app startup.
 * Should generally be set to the name of the redux domain.
 */
export function createReducer<State>(handlers: ReducerMap<State>, initialState: State) {
  return function reducer(state: State, action: Action): State {
    let currentState = state
    if (currentState === undefined) currentState = initialState

    const handler = handlers[action.type]
    if (!handler) return currentState
    return handler(currentState, action)
  }
}

/**
 * Create store for the app given a map of domain reducer methods and a `history` object (e.g. browser history).
 * React-router will be set up as `router` domain.
 * Automatically sets up `thunk` middleware and redux devtools.
 *
 * @param reducerMap Combined domain `reducerMap`s
 * @param history `history` object for react-router, generally `createBrowserHistory()`.
 * @param appStorage AppStorage object, used to store domains and re-hydrated on reload.
 * @param domainsToSave String keys for domains to save.
 *
 * Note that this is for the browser only -- see `createMockStore` and `createStoryProvider`
 * in `utils/store_test_utils.ts` for mocking stores in tests.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createAppStore<AppState>(
  reducerMap: ReducerMap<any>,
  history: History,
  appStorage?: AppStorage,
  domainsToSave?: string[]
): Store<CombinedState<AppState>> {
  let rootReducer = combineReducers({
    router: connectRouter(history),
    ...reducerMap
  })
  // Wrap root reducer with appStorage storage/re-hydration code
  if (appStorage && domainsToSave) {
    rootReducer = wrapReducerForAppStorage(rootReducer, appStorage, domainsToSave)
  }

  // Use redux devtools if defined
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  // set up middleware
  const middlewares = [
    routerMiddleware(history),
    thunk,
    createLogger({
      collapsed: true
    })
  ]
  const enhancers = composeEnhancers(applyMiddleware(...middlewares))
  return createStore(rootReducer, enhancers)
}

/**
 * Bind action called with specific parameters to `dispatch`, re-calculating only when `deps` change.
 * e.g.
 *    const someAction = useBoundAction(() => actions.someAction(param1), [param1])
 *    ...
 *    <button onClick={someAction}/>
 */
export function useBoundAction(boundAction: ActionCreator, deps: any[] = []) {
  const dispatch = useDispatch()
  return useCallback(
    (...args) => {
      const action = boundAction(...args)
      if (action) return dispatch(action)
    },
    [boundAction, dispatch, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  )
}
