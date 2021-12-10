import { actions } from './actions'
import { selectors } from './selectors'
import { reducer } from './reducer'
import { hooks } from './hooks'
import { getInitialState } from './types'

export * from './actions'
export * from './reducer'
export * from './selectors'
export * from './types'
export * from './hooks'

export default { actions, hooks, reducerMap: reducer, selectors, getInitialState }
