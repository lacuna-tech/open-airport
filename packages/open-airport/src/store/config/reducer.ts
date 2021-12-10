import { LoadState } from '@lacuna/ui-common'
import { createReducer } from '@reduxjs/toolkit'
import { ConfigActions, getInitialState } from './types'

export const organizationConfigReducer = {
  organizationConfigState: createReducer(getInitialState(), {
    [ConfigActions.LOAD_ORGANIZATION_CONFIG]: state => ({ ...state, loaded: LoadState.loading }),
    [ConfigActions.LOAD_ORGANIZATION_CONFIG_FAILED]: state => ({ ...state, loaded: LoadState.error }),
    [ConfigActions.LOAD_ORGANIZATION_CONFIG_SUCCESS]: state => {
      return { ...state, loaded: LoadState.loaded }
    }
  })
}
