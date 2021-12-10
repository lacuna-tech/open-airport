/* eslint-disable no-use-before-define */

/**
 * MDS jurisdictions loading / manipulation
 */
import { useSelector } from 'react-redux'

import { UUID } from '@mds-core/mds-types'
import { createSelector } from 'reselect'
import { createReducer, ThunkedPromise, ReducerMap, LoadState } from '../../util/store_utils'
import { mdsJurisdiction, ServerConfig } from '../../service'
import { Jurisdiction } from '../../lib/jurisdiction'
import { selectors as authSelectors } from '../auth/auth'
import { selectors as serverConfigSelectors } from '../serverConfig/serverConfig'
import notifier from '../notifier/notifier'

/** Non-redux state:
 *  We need some things (notably providers and jurisdictions) outside of redux.
 *  Import these functions from `ui-common` to do so.
 */
const _jurisdictions_: Jurisdiction[] | null = null
export function getJurisdictions() {
  return _jurisdictions_
}
export function getJurisdictionById(jurisdiction_id?: UUID, jurisdictions = getJurisdictions()) {
  if (!jurisdiction_id || !jurisdictions) return undefined
  return jurisdictions.find(p => p.jurisdiction_id === jurisdiction_id)
}
export function getJurisdictionByKey(agency_key?: string, jurisdictions = getJurisdictions()) {
  if (!jurisdictions || !agency_key) return undefined
  return jurisdictions.find(p => p.agency_key.toLowerCase() === agency_key.toLowerCase())
}
export function getJurisdictionByGeographyId(geography_id: UUID, jurisdictions = getJurisdictions()) {
  if (!jurisdictions) return undefined
  return jurisdictions.find(p => p.geography_id === geography_id)
}

/**
 * Domain state shape:
 * @param loaded Current load state for all jurisdiction summaries.
 * @param jurisdictionList List of jurisdiction summaries in server-defined order.
 */

export interface JurisdictionsState {
  /** Current load state. */
  loaded: LoadState
  /** List of jurisdictions loaded. */
  jurisdictions: Jurisdiction[]
}

// Initial domain state.
function getInitialState(): JurisdictionsState {
  return {
    loaded: LoadState.unloaded,
    jurisdictions: []
  }
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface JurisdictionsReducerState {
  jurisdictions: JurisdictionsState
}

/** Selectors / hooks */
export const selectors = {
  /** Return the full state. */
  jurisdictionsState(state: JurisdictionsReducerState) {
    return state.jurisdictions
  },
  /** @hook returns entire jurisdiction domain state */
  useJurisdictionsState() {
    return useSelector(selectors.jurisdictionsState)
  },
  /** @hook returns current list of jurisdictions */
  useJurisdictions(): Jurisdiction[] {
    return selectors.useJurisdictionsState().jurisdictions
  },
  /** @hook returns current list of jurisdiction `agency_name`s, sorted in ascending order. */
  useJurisdictionNames() {
    const jurisdictions = selectors.useJurisdictions() || []
    return jurisdictions.map(j => j.agency_name).sort()
  },
  /** @hook returns jurisdiction from current list by UUID */
  useJurisdiction(jurisdiction_id?: UUID): Jurisdiction | undefined {
    return getJurisdictionById(jurisdiction_id, selectors.useJurisdictions())
  },
  /** @hook Return jurisdiction specified by agency_key, case INsensitive. */
  useJurisdictionByKey(agency_key?: string): Jurisdiction | undefined {
    return getJurisdictionByKey(agency_key, selectors.useJurisdictions())
  },
  /**
   * @hook returns "main" jurisdiction for the orgniazation, or `undefined` if not found.
   * THROWS if:
   *  - `jurisdictions` have not been loaded
   *  - `organization` config has not been loaded
   *  - `organization` config does not have `.jurisdiction` set
   *  - `organization.jurisdiction` is not found in loaded jurisdictions
   */
  selectMainJurisdiction: createSelector(
    [
      serverConfigSelectors.serverConfig,
      (state: JurisdictionsReducerState) => {
        return state.jurisdictions
      }
    ],
    (serverConfigState: ServerConfig, jurisdictionsState: JurisdictionsState) => {
      const { organization } = serverConfigState
      if (!organization) throw new TypeError('useMainJurisdiction(): organization is unloaded')
      const mainJurisdictionKey = organization.jurisdiction
      if (!mainJurisdictionKey)
        throw new TypeError("useMainJurisdiction(): organization does not have a 'jurisdiction'")
      const jurisdiction = getJurisdictionByKey(mainJurisdictionKey, jurisdictionsState.jurisdictions)
      if (!jurisdiction)
        throw new TypeError(`useMainJurisdiction(): main jurisdiction '${mainJurisdictionKey}' not found!`)
      return jurisdiction
    }
  ),
  useMainJurisdiction(): Jurisdiction {
    return useSelector(selectors.selectMainJurisdiction)
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<JurisdictionsState> = {}

/**
 * Generic handler to replace set of `jurisdictions` in memory with new list.
 */
handlers.setJurisdictions = (state, { payload: { jurisdictions = state.jurisdictions, loaded = state.loaded } }) => ({
  ...state,
  loaded,
  jurisdictions
})

/**
 * Load all jurisdictions for this agency.
 * js - optional jurisdictions.  If passed, jurisdictions will not be fetched
 * Promise resolves with list of jurisdictions loaded.
 */
function loadJurisdictions(js?: Jurisdiction[]): ThunkedPromise<Jurisdiction[]> {
  return async (dispatch, getState) => {
    const authToken = authSelectors.authToken(getState())
    dispatch({ type: 'loadingJurisdictions', payload: { jurisdictions: [], loaded: LoadState.loading } })
    try {
      let jurisdictions
      if (js && js.length > 0) {
        jurisdictions = js
      } else {
        const result = await mdsJurisdiction.fetchJurisdictions({ authToken })
        jurisdictions = result.jurisdictions
      }
      dispatch({ type: 'loadedJurisdictions', payload: { jurisdictions, loaded: LoadState.loaded } })
      return jurisdictions
    } catch (error) {
      dispatch({ type: 'loadJurisdictionsError', payload: { jurisdictions: [], loaded: LoadState.error } })
      dispatch(notifier.actions.displayError('Error loading jurisdictions:', error))
    }
  }
}
handlers.loadingJurisdictions = handlers.setJurisdictions
handlers.loadedJurisdictions = handlers.setJurisdictions
handlers.loadJurisdictionsError = handlers.setJurisdictions

// Group domain actions for export (necessary so actions are typed)
export const actions = {
  loadJurisdictions
}

// `reducerMap` used to create reducer for this store.
export const reducerMap = { jurisdictions: createReducer<JurisdictionsState>(handlers, getInitialState()) }

export default { actions, reducerMap, selectors, getInitialState }
