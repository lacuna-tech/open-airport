import { actions } from './actions'
import { getInitialState } from './types'
import { reducer } from './reducer'
import { selectors } from './selectors'

export * from './hooks'
export * from './service'
export * from './types'

export default { actions, reducerMap: reducer, getInitialState, selectors }
