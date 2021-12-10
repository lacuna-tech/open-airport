/**
 * Wrapper for connected-react-router to make it work with our redux/typescript pattern.
 * Assumes use of `store_utils::createAppStore()` to set up the store.
 */

import { push, replace } from 'connected-react-router'
import type { RouterState } from 'connected-react-router'
import { useSelector } from 'react-redux'

/**
 * Domain state shape:
 * Re-export react-rouder `RouterState` as our domain state.
 */
export type { RouterState }

// ReducerState: used to create full `AppState` shape and for selectors
export interface RouterReducerState {
  router: RouterState
}

/**
 * Selectors and hooks
 * @selector `location` Returns react-router `location` from app state.
 * @hook `useLocation()` Hook to get `location`
 */
export const selectors = {
  // Return history `location` object
  location(state: RouterReducerState) {
    return state.router.location
  },
  useLocation() {
    return useSelector(selectors.location)
  }
}

/**
 * Export renamed actions from connected-react-router
 */
export const actions = {
  /**
   * Show a particular page.
   * NOTE: don't use this directly, create a specific action handler for each page you want to show.
   */
  showPage: push,

  /**
   * Show a particular page, replacing the current page in browser history (defeats back button).
   * NOTE: don't use this directly, create a specific action handler for each page you want to show.
   */
  replacePage: replace
}

// NOTE: There is no `reducer` here: that's set up automatically by `store_utils::createAppStore()`
//       because it must be combined with dynamically-created `history`.
export default { actions, selectors }
