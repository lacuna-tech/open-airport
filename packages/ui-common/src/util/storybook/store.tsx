/**
 * Storybook utilites for testing components which use redux store via hooks.
 */
import React from 'react'
import { createMemoryHistory } from 'history'
import { ConnectedRouter, connectRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { action } from '@storybook/addon-actions'

import { ActionCreatorMap } from '../store_utils'

/**
 * Given a `reducerMap`, return a redux `<Provider>` which:
 *  - you can use to wrap an individual StoryBook story
 *  - can be passed an initial `state`
 *  - hooks up ConnectedRouter and reflects optional URL `path` passed in.
 * Note:
 *  - State is maintained separately for each story.
 *  - When you switch between stories, the store state is reset.
 *  - Pass `path` param to specify route if you care about routing.
 *
 * e.g.
 *    import { reducerMap } from 'some/store/domain/file'
 *    import { otherReducerMap } from 'some/other/store/domain/file'
 *    const StoryProvider = createStoryProvider(reducerMap, otherReducerMap)
 *    storiesOf('My Component', module)
 *      .add('story1', () => {
 *        <StoryProvider state={{...initial_state...}}>
 *          <MyComponent prop='value1'>
 *        </StoryProvider>
 *      })
 *      .add('story2 which uses specific url path', () => {
 *        <StoryProvider path='/some-page' state={{...different_initial_state...}}>
 *          <MyComponent prop='value2'>
 *        </StoryProvider>
 *      })
 */
export interface StorybookProviderProps {
  /** Initial store state. */
  state?: Record<string, unknown>
  /** Simulated URL for the query.  Ignore if tests don't require routing. */
  path?: string
  /** Children to actually render. */
  children: React.ReactNode
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStoryProvider(...reducerMaps: any[]) {
  return function StoryProvider({ state = {}, path = '/', children }: StorybookProviderProps) {
    // Set up history for connected-react-router and manually update to match specified path.
    const history = createMemoryHistory()
    history.push(path)

    // Set up store reducer, including connected-react-router
    const combinedReducerMap = Object.assign({ router: connectRouter(history) }, ...reducerMaps)
    const rootReducer = combineReducers(combinedReducerMap)

    // Create store with the specified state
    const store = createStore(rootReducer, state, applyMiddleware(thunk, logger))

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>{children}</ConnectedRouter>
      </Provider>
    )
  }
}

/**
 * Given `actions` as an `ActionCreatorMap`, stub action creators with specified `actionNames`
 * to call storybook `action` handler rather than doing redux dispatch as normal.
 *
 * This allows you to stub out network requests, etc. for components which internally use
 * `useDispatch()` to dispatch actions from action creators.
 *
 * e.g.
 *    import { actions } from 'somre/store/domain/file'
 *    stubStoryActions(actions, 'actionCreator1', 'actionCreator2')
 *
 */
export function stubStoryActions(actions: ActionCreatorMap, ...actionNames: string[]) {
  const newActions = { ...actions }
  actionNames.forEach(actionName => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newActions[actionName] = (...args: any[]) => action(`${actionName}(${args})`)
  })
}
