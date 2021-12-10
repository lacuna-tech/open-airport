/**
 * Notifier state
 */

import { useSelector } from 'react-redux'
import { createReducer, Action, ReducerMap } from '../../util/store_utils'

enum NoticeVariant {
  default = 'default',
  success = 'success',
  error = 'error',
  info = 'info'
}
export interface Notice {
  key: string
  message: string
  variant: NoticeVariant
}

/**
 * Domain state shape:
 */
export interface NotifierState {
  notices: Notice[]
}

// Initial domain state.
function getInitialState(): NotifierState {
  return {
    notices: []
  }
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface NotifierReducerState {
  notifier: NotifierState
}

/**
 * Selectors and hooks
 * @selector `notifier()` Returns entire domain state.
 * @hook `useRuleEditor()` Hook to get entire domain state.
 */
const selectors = {
  // Get notifier state
  notifier(state: NotifierReducerState): NotifierState {
    return state.notifier
  },
  useNotifier(): NotifierState {
    return useSelector(selectors.notifier)
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<NotifierState> = {}

/**
 * Display a notice snackbar to the user.
 * NOTE: use `displayError` if you have an `Error` object.
 */
function displayNotice(message: string, variant: keyof typeof NoticeVariant = 'default'): Action {
  const notice: Notice = {
    key: `${Date.now()}${Math.random()}`,
    message,
    variant: variant as NoticeVariant
  }
  return { type: 'displayNotice', payload: { notice } }
}
handlers.displayNotice = (state, { payload: { notice } }) => ({
  ...state,
  notices: [...state.notices, notice]
})

/**
 * Display an error notice snackbar to the user.
 */
function displayError(message: string, error: Error): Action {
  const notice: Notice = {
    key: `${Date.now()}${Math.random()}`,
    message: `${message} ${error.message}`,
    variant: NoticeVariant.error
  }
  // eslint-disable-next-line no-console
  console.error(message, error)
  // eslint-disable-next-line no-console
  console.info({ ...error })
  return { type: 'displayError', payload: { notice } }
}
handlers.displayError = handlers.displayNotice

/**
 * Clear a notice specified by `key`.
 */
function clearNotice(key: string): Action {
  return { type: 'clearNotice', payload: { key } }
}
handlers.clearNotice = (state, { payload: { key } }) => ({
  ...state,
  notices: state.notices.filter(notice => notice.key !== key)
})

// Group domain actions for export (necessary so actions are typed)
const actions = {
  displayNotice,
  displayError,
  clearNotice
}

// `reducerMap` used to create reducer for this store.
const reducerMap = { notifier: createReducer<NotifierState>(handlers, getInitialState()) }

export default { actions, selectors, reducerMap, getInitialState }
