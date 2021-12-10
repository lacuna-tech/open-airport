/**
 * Jest utilities for testing redux stores, action creators, etc.
 */
import { combineReducers } from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk, { ThunkDispatch } from 'redux-thunk'

import { Action, ReducerMap } from '../store_utils'

/**
 * 
 * Return a function which will create a "mock store", based on `redux-mock-store`.
 * If you pass a ReducerMap, we'll add a method `applyActions(actions)`
 * which applies a list of actions to the store `initialState` and returns the resulting state.
 * e.g.
 *    const mockStore = createMockStore({ a: reducerForA, b: reducerForB })
 *    test('action and reducer', async () => {
 *      const store = mockStore(<initial_state>)
 *      await store.dispatch(someAsyncActionCreator())
 *      expect(store.getActions()).toEqual(<list of action objects>)
 *      expect(store.applyActions()).toEqual(<state after actions were applied>)
 *    })

 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockStore(reducerMap?: ReducerMap<any>) {
  // See:  https://stackoverflow.com/questions/52648553/typescript-unit-tests-correct-typing-for-dispatching-a-thunk-with-store-dispat
  type DispatchExts = ThunkDispatch<Record<string, unknown>, void, Action>
  const middleware = [thunk]
  const storeCreator = configureMockStore<Record<string, unknown>, DispatchExts>(middleware)
  return function createStore(initialState = {}) {
    const originalStore = storeCreator(initialState)

    // `applyActions()` method which you call to see the effect of an array of actions on the reducer.
    // If you call `applyActions()` without passing arguments, it'll execute all of the actions from previous `store.dispatch`es.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyActions(actions = originalStore.getActions()): any {
      if (reducerMap == null) return initialState
      // Set up the `reducer` from `reducerMap`
      const reducer = combineReducers(reducerMap)
      // Run the actions through the reducer one at a time
      return actions.reduce((currentState, action) => {
        return reducer(currentState, action)
      }, initialState)
    }

    return {
      ...originalStore,
      applyActions
    }
  }
}
