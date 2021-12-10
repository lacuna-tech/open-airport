/* eslint-disable @typescript-eslint/no-use-before-define */

import { useSelector } from 'react-redux'

// import decode from 'jwt-decode'
// import qs from 'query-string'
// import { replace } from 'connected-react-router'
// import { PMConfig } from '@lacuna/agency-config'
// import { UUID } from '@mds-core/mds-types'
// import { QueryString } from '../../util/QueryString'
// import { AccessTokenScope, AccessTokenScopes } from './access-token-scopes'
import { createReducer, ReducerMap, ThunkedPromise } from '../../util/store_utils'
import identityService from '../../service/identity/identity-service'
import type { CreateUserRequest, CreateUserResponse } from '../../service/identity/identity-service'
import { selectors as authSelectors } from '../auth/auth'

export type { CreateUserRequest }

// export enum AuthenticationStatus {
//   authenticating = 'authenticating',
//   authenticated = 'authenticated',
//   authenticationFailed = 'authenticationFailed'
// }

export interface User {
  user_id: string
  name?: string
}

/**
 * Domain state shape:
 * @param users Current users
 * @param roles Available roles
 */
export interface UserState {
  readonly userMap: { [user_id: string]: User }
}

/** Initial domain state. */
function getInitialState(): UserState {
  return {
    userMap: {}
  }
}

/** ReducerState: used to create full `AppState` shape and for selectors. */
export interface UsersReducerState {
  users: UserState
}

/** Selectors and hooks. */
export const selectors = {
  /** @selector Return full UserState. */
  users(state: UsersReducerState): UserState {
    return state.users as UserState
  },
  /** @hook Return full `UserState`. */
  useUserState(): UserState {
    return useSelector(selectors.users)
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<UserState> = {}

/**
 * Generic handler add or update a single user in our list.
 */
// handlers.setUser = (state, { payload: { user } }) => {
//   debugger
//   if (user === null || !user.user_id) {
//     // eslint-disable-next-line no-console
//     console.warn(`users.setUser handler: got invalid user:`, user)
//     return { ...state }
//   }
//   return {
//     ...state,
//     userMap: {
//       ...state.userMap,
//       [user.user_id]: { user_id: user.user_id }
//     }
//   }
// }

/**
 * Create a new user.  Throws error if unsuccessful.
 * TODO: Promise resolves with new user after it comes back from the server.
 */
function createUser(user: CreateUserRequest): ThunkedPromise<CreateUserResponse> {
  return async (dispatch, getState) => {
    const authToken = authSelectors.authToken(getState())
    const newUser = await identityService.createUser({ authToken, user })
    dispatch({ type: 'createUser', payload: { newUser } })
    return newUser
  }
}
// handlers.createUser = handlers.setUser

// Group domain actions for export (necessary so actions are typed)
const actions = {
  createUser
}

// `reducerMap` used to create reducer for this store.
const reducerMap = { users: createReducer<UserState>(handlers, getInitialState()) }

export default { actions, reducerMap, selectors, getInitialState }
