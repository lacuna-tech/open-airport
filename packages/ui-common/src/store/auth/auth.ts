/* eslint-disable @typescript-eslint/no-use-before-define */

import { useSelector } from 'react-redux'

import decode from 'jwt-decode'
import qs from 'query-string'
import { replace } from 'connected-react-router'
import { AuthConfig } from '@lacuna/agency-config'
import { UUID } from '@mds-core/mds-types'
import { QueryString } from '../../util/QueryString'
import { AccessTokenScope, AccessTokenScopes } from './access-token-scopes'
import { createReducer, ThunkedAction, ReducerMap, ThunkedPromise } from '../../util/store_utils'
import identityService, { Authentication } from '../../service/identity/identity-service'
import notifier from '../notifier/notifier'
import AppStorage from '../../util/AppStorage'

const appStorage = new AppStorage('Identity')

declare global {
  interface Window {
    authConfig: AuthConfig
  }
}

/**
 * Session state:
 * @param access_token Access Token
 * @param id_token Id Token
 * @param expiresAt Timestamp when currently login is no longer valid.
 */
export interface SessionState extends Pick<Authentication, 'access_token' | 'id_token' | 'scope'> {
  readonly expiresAt: number
}

/**
 * Session state:
 * @param email Email
 * @param given_name First Name
 * @param family_name Last Name
 * @param locale locale
 * @param picture Picture
 * @param sub Subject
 */
export interface ProfileState {
  email: string
  given_name: string
  family_name: string
  locale: string
  picture: string
  sub: string
}

export enum AuthenticationStatus {
  authenticating = 'authenticating',
  authenticated = 'authenticated',
  authenticationFailed = 'authenticationFailed'
}

/**
 * Domain state shape:
 * @param isAuthenticated `true` if we are currently logged in.
 * @param session Session state, set after login.
 * @param profile User profile, set after login.
 * @param permissions Assigned permissions, set after login.
 */
export interface AuthState {
  readonly authenticationStatus: AuthenticationStatus
  readonly session?: SessionState
  readonly profile?: ProfileState
  readonly permissions: AccessTokenScope[]
  readonly agencies: string[]
  readonly provider_id?: string
}

/** Initial domain state. */
function getInitialState(): AuthState {
  return {
    authenticationStatus: AuthenticationStatus.authenticating,
    session: undefined,
    profile: undefined,
    permissions: [],
    agencies: [],
    provider_id: undefined
  }
}

/** ReducerState: used to create full `AppState` shape and for selectors. */
export interface AuthReducerState {
  auth: AuthState
}

/** Selectors and hooks. */
export const selectors = {
  /** @selector Return full AuthState. */
  auth(state: AuthReducerState): AuthState {
    return state.auth as AuthState
  },
  /** @hook Return full `AuthState`. */
  useAuthState(): AuthState {
    return useSelector(selectors.auth)
  },

  /** @selector Return `true` if we are currently authenticated. */
  isAuthenticated(state: AuthReducerState): boolean {
    return state.auth && state.auth.authenticationStatus === AuthenticationStatus.authenticated
  },
  /** @hook Return `true` if we are currently authenticated. */
  useIsAuthenticated(): boolean {
    return useSelector(selectors.isAuthenticated)
  },

  /** @selector Return current authentication status. */
  authenticationStatus(state: AuthReducerState): AuthenticationStatus {
    return state.auth ? state.auth.authenticationStatus : AuthenticationStatus.authenticating
  },
  /** @hook Return current authentication status. */
  useAuthenticationStatus(): AuthenticationStatus {
    return useSelector(selectors.authenticationStatus)
  },

  /** @selector Return session state from full app state (requires login). */
  selectSession(state: AuthReducerState) {
    return state.auth.session
  },
  /** @hook Return session state from full app state (requires login). */
  useSession() {
    return useSelector(selectors.selectSession)
  },

  /** @selector Return access_token for the authenticted user (requires login). */
  authToken(state: AuthReducerState) {
    return state.auth && state.auth.session && state.auth.session.access_token
  },

  /** @selector Return user profile from full app state (requires login). */
  permissions(state: AuthReducerState): AccessTokenScope[] {
    return state.auth && state.auth.permissions
  },
  /** @hook Return user profile from full app state (requires login). */
  usePermissions(): AccessTokenScope[] {
    return useSelector(selectors.permissions) || []
  },

  /** @selector Return user agencies from full app state (requires login). */
  agencies(state: AuthReducerState): UUID[] {
    return state.auth && state.auth.agencies
  },
  /** @hook Return user profile from full app state (requires login). */
  useAgencies(): UUID[] {
    return useSelector(selectors.agencies) || []
  },

  /** @selector Return full user profile (requires login). */
  selectProfile(state: AuthReducerState): ProfileState | undefined {
    return state.auth.profile
  },
  /** @hook Return full user profile (requires login). */
  useProfile(): ProfileState | undefined {
    return useSelector(selectors.selectProfile)
  },

  /** @selector Return provider id associagted with this user (requires login). */
  authProviderId(state: AuthReducerState): string | undefined {
    return state.auth && state.auth.provider_id
  },
  /** @hook Return provider id associagted with this user (requires login). */
  useAuthProviderId(): string | undefined {
    return useSelector(selectors.authProviderId)
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<AuthState> = {}

/**
 * Initialize authentication during app startup.
 */
function initAuth(): ThunkedAction {
  return (dispatch, getState) => {
    const authentication: Authentication = appStorage.get('AuthN')
    const { code } = qs.parse(window.location.search)

    if (code) {
      // There is a code in parameter in the current URL. We must be coming from login.
      // First, remove the code from query string
      const query = QueryString().remove('code')
      dispatch(
        replace({
          pathname: `${window.location.pathname}${query ? `?${query}` : ''}`,
          state: getState()
        })
      )
      // Then, exchange the code for an access token.
      dispatch(actions.processAuthorizationCode(code as string))
    } else if (authentication) {
      // There is some authentication information in local storage.
      // Let's see if it's still valid and use it if so.
      const { access_token } = authentication

      if (identityService.isTokenValid(access_token)) {
        dispatch(actions.saveAuth(authentication))
      } else {
        dispatch(actions.logout())
      }
    } else {
      // User is not authenticated. Let's send them to login.
      dispatch(actions.logout())
    }
  }
}

/**
 * Process the authorization code to get access token
 */
function processAuthorizationCode(code: string): ThunkedPromise<Authentication> {
  return async dispatch => {
    try {
      const code_verifier = appStorage.getAndRemove('code_verifier')
      dispatch(actions.saveAuth(await identityService.fetchToken(code, code_verifier)))
    } catch (error) {
      dispatch(actions.failAuth(error))
    }
  }
}

/**
 * Handle when the access token is soon expiring or has expired
 */
function renewAuth(): ThunkedAction {
  return dispatch => {
    // For now, just redirect to login so user logs in again.
    dispatch(actions.logout())
  }
}

/**
 * Save auth success result
 */
interface AccessToken extends Record<string, string | string[] | number | undefined> {
  exp: number
}
function saveAuth(authentication: Authentication): ThunkedAction {
  return dispatch => {
    const { access_token, id_token, scope } = authentication
    const decodedAccessToken: AccessToken = decode(access_token)
    const { exp } = decodedAccessToken

    // Convert scope to permissions and intersect with all known scopes
    const scopes = scope.split(' ')
    const permissions = AccessTokenScopes.reduce<AccessTokenScope[]>((p, s) => (scopes.includes(s) ? [s, ...p] : p), [])

    // Get profile
    const profile: ProfileState = decode(id_token)

    // Get the provider_id from user's access_token
    const provider_id: string | undefined = decodedAccessToken[
      `${window.authConfig.identity.claimNamespace}provider_id`
    ] as string

    // Get the agencies from user's access_token
    const agencies: string[] | undefined = decodedAccessToken[
      `${window.authConfig.identity.claimNamespace}agency_key`
    ] as string[]

    dispatch({
      type: 'saveAuth',
      payload: {
        authenticationStatus: AuthenticationStatus.authenticated,
        isAuthenticated: true,
        session: { ...authentication, expiresAt: exp * 1000 },
        profile,
        permissions,
        agencies,
        provider_id
      }
    })

    appStorage.store('AuthN', authentication)
  }
}
handlers.saveAuth = (state, { payload }) => payload as AuthState

/**
 * Fail auth when unsuccessful
 */
function failAuth(error: Error): ThunkedAction {
  return (dispatch, getState) => {
    const { auth } = getState()
    dispatch({
      type: 'failAuth',
      payload: { ...auth, authenticationStatus: AuthenticationStatus.authenticationFailed }
    })

    dispatch(notifier.actions.displayError('Authentication failed:', error))
  }
}
handlers.failAuth = (state, { payload }) => payload as AuthState

/**
 * Log out
 */
function logout(): ThunkedAction {
  return () => {
    appStorage.remove('AuthN')

    const { code_verifier, code_challenge } = identityService.generateChallenge()
    appStorage.store('code_verifier', code_verifier)

    window.location.href = identityService.buildLogoutUrl(code_challenge)
  }
}

// Group domain actions for export (necessary so actions are typed)
const actions = {
  initAuth,
  processAuthorizationCode,
  renewAuth,
  saveAuth,
  failAuth,
  logout
}

// `reducerMap` used to create reducer for this store.
const reducerMap = { auth: createReducer<AuthState>(handlers, getInitialState()) }

export default { actions, reducerMap, selectors, getInitialState }
