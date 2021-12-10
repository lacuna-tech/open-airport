import { actions } from './actions'
import { selectors } from './selectors'
import { reducer } from './reducer'
import { getInitialState } from './types'

export * from './actions'
export * from './reducer'
export * from './selectors'
export * from './service'
export * from './types'
export * from './hooks'

// eslint-disable-next-line import/no-anonymous-default-export
export default { actions, selectors, reducerMap: reducer, getInitialState }
