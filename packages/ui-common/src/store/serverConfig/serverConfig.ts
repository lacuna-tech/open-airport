/* eslint-disable no-use-before-define */

/**
 * MDS server config loading / manipulation
 */
import { useSelector } from 'react-redux'

import { UUID, Provider } from '@mds-core/mds-types'
import { LngLatBoundsLike } from 'mapbox-gl'
import { createReducer, ThunkedPromise, ReducerMap, LoadState } from '../../util/store_utils'
import { mdsConfig, ServerConfig, ServerConfigPropertyName } from '../../service'

import { selectors as authSelectors } from '../auth/auth'
import notifier from '../notifier/notifier'

/** Non-redux state:
 *  We need some things (notably providers and jurisdictions) outside of redux.
 *  Import these functions from `ui-common` to do so.
 */
let _providers_: Provider[] | undefined
export function getProviders() {
  return _providers_
}
export function getProviderIds(): UUID[] {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return _providers_!.map(p => p.provider_id)
}
export function getProviderById(provider_id: UUID, providers = getProviders()) {
  if (!providers) return undefined
  return providers.find(p => p.provider_id === provider_id)
}
export function getProviderName(provider_id: UUID, unkownValue = '(Unknown provider)', providers = getProviders()) {
  const provider = getProviderById(provider_id, providers)
  return provider ? provider.provider_name : unkownValue
}

let _vehicleTypes_: string[] | undefined
export function getVehicleTypes() {
  if (!_vehicleTypes_) return undefined
  return _vehicleTypes_
}

/**
 * Domain state shape:
 */
type ConfigLoadStates = {
  [key in ServerConfigPropertyName]: LoadState
}
export interface ServerConfigState {
  /** Internal map of load state for each known file. */
  loadStates: ConfigLoadStates
  /** Actual merged config object. */
  config: ServerConfig
}

// Initial domain state.
function getInitialState(): ServerConfigState {
  return {
    loadStates: {
      organization: LoadState.unloaded,
      providers: LoadState.unloaded,
      featureFlags: LoadState.unloaded,
      invoice: LoadState.unloaded
    },
    config: {
      organization: undefined,
      providers: undefined,
      featureFlags: undefined,
      invoice: undefined
    }
  }
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface ServerConfigReducerState {
  serverConfig: ServerConfigState
}

/**
 * Selectors / hooks
 */

const worldMapBounds: LngLatBoundsLike = [
  [-54.162433968067795, -517.5],
  [82.85338229176081, -188.4375]
]

/** Return composite load state for specified fileNames. */
function serverConfigFilesLoadedState(loadStates: ConfigLoadStates, fileNames: ServerConfigPropertyName[]) {
  let loadedCount = 0
  let anyLoading = false
  let anyErrors = false
  fileNames.forEach(fileName => {
    const state = loadStates[fileName]
    if (state === LoadState.loading) anyLoading = true
    else if (state === LoadState.loaded) loadedCount++
    else if (state === LoadState.error) anyErrors = true
  })
  if (loadedCount === fileNames.length) return LoadState.loaded
  if (anyErrors) return LoadState.error
  if (anyLoading) return LoadState.loading
  return LoadState.unloaded
}

export const selectors = {
  /** Return the full state. */
  serverConfigState(state: ServerConfigReducerState) {
    return state.serverConfig
  },
  useServerConfigState() {
    return useSelector(selectors.serverConfigState)
  },

  /** Return just the loaded config state. */
  serverConfig(state: ServerConfigReducerState) {
    return state.serverConfig.config
  },
  useServerConfig() {
    return useSelector(selectors.serverConfig)
  },

  /** Return composite load state for a list of serverConfig files. */
  useServerConfigFilesLoadState(fileNames: ServerConfigPropertyName[]) {
    return serverConfigFilesLoadedState(useSelector(selectors.serverConfigState).loadStates, fileNames)
  },

  useOrganizationMapBounds() {
    const { organization } = selectors.useServerConfig()
    return organization ? organization.mapBounds : worldMapBounds
  },

  //
  //  providers
  //

  /** Return list of all active providers.
   *  Returns `null` if not loaded. */
  providers(state: ServerConfigReducerState) {
    return selectors.serverConfig(state).providers
  },
  useProviders() {
    return useSelector(selectors.providers)
  },
  useProviderMap() {
    return (selectors.useProviders() || []).reduce<{ [key in UUID]: Provider }>(
      (providerMap, provider) => ({ ...providerMap, [provider.provider_id]: provider }),
      {}
    )
  },
  /** @hook provider_id for all known providers. */
  useProviderIds() {
    return (selectors.useProviders() || []).map(p => p.provider_id)
  },
  /** Return provider specified by provider_id. */
  useProviderById(provider_id: UUID) {
    return getProviderById(provider_id, useSelector(selectors.providers))
  },
  /** Return `provider_name` given `provider_id` */
  useProviderName(provider_id: UUID, unknownValue?: '(unknown provider)') {
    return getProviderName(provider_id, unknownValue, useSelector(selectors.providers))
  },
  /** Return provider specified by provider_name, case INsensitive. */
  useProviderByName(name: string) {
    const providers = useSelector(selectors.providers)
    if (!name || !providers) return undefined
    return providers.find(p => p.provider_name.toLowerCase() === name.toLowerCase())
  },

  //
  //  organizations
  //

  /** Return list of all jurisdictions.
   *  Returns `null` if not loaded. */
  organization(state: ServerConfigReducerState) {
    return selectors.serverConfig(state).organization
  },
  useOrganization() {
    return useSelector(selectors.organization)
  }
}

/**
 * Actions and action handlers:
 * 1) Create actions methods and join into an `actions` map below.
 * 2) Below each action that requires a unique handler,
 *    add a handler method to `handlers.<actionName>`
 */
const handlers: ReducerMap<ServerConfigState> = {}

/**
 * Generic handler to update state during/after loading.
 */
handlers.setServerConfig = (state, { payload }) => {
  const {
    fileNames,
    loadState,
    newConfig
  }: { fileNames: ServerConfigPropertyName[]; loadState: LoadState; newConfig?: ServerConfig } = payload
  // Update loaded for all fileNames passed in
  const loadStates = { ...state.loadStates }
  fileNames.forEach(fileName => {
    loadStates[fileName] = loadState
  })
  // Bail early if no config passed
  if (!newConfig) {
    return { ...state, loadStates }
  }

  const newState = {
    ...state,
    loadStates,
    config: { ...state.config, ...newConfig }
  }
  // SET NON-REDUX STATE
  _providers_ = newState.config.providers
  _vehicleTypes_ = newState.config.organization ? newState.config.organization.vehicleTypes : []
  return newState
}

/**
 * Load specific server config files for this agency.
 * Promise resolves with union of all loaded configs.
 */
function loadServerConfig(fileNames: ServerConfigPropertyName[]): ThunkedPromise<ServerConfig> {
  return async (dispatch, getState) => {
    const authToken = authSelectors.authToken(getState())
    dispatch({ type: 'loadingServerConfig', payload: { fileNames, loadState: LoadState.loading } })
    try {
      /* eslint-disable-next-line no-console */
      console.info('Server config: fetching', fileNames)
      const newConfig = await mdsConfig.fetchServerConfigs({ authToken, fileNames })
      /* eslint-disable-next-line no-console */
      console.info('Server config: loaded', newConfig)
      dispatch({ type: 'loadedServerConfig', payload: { fileNames, loadState: LoadState.loaded, newConfig } })
      return selectors.serverConfig(getState())
    } catch (error) {
      dispatch({ type: 'loadServerConfigError', payload: { fileNames, loadState: LoadState.error } })
      dispatch(notifier.actions.displayError('Error loading config:', error))
    }
  }
}
handlers.loadingServerConfig = handlers.setServerConfig
handlers.loadedServerConfig = handlers.setServerConfig
handlers.loadServerConfigError = handlers.setServerConfig

// Group domain actions for export (necessary so actions are typed)
export const actions = {
  loadServerConfig
}

// `reducerMap` used to create reducer for this store.
export const reducerMap = { serverConfig: createReducer<ServerConfigState>(handlers, getInitialState()) }

export default { actions, reducerMap, selectors, getInitialState }
