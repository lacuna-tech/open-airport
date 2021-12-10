import { auth, notifier, AuthReducerState } from '@lacuna/ui-common'
import { GeographiesActions, PushGeographiesAction } from '@lacuna/ui-common/src/store/geographies'

import { ThunkAction } from 'redux-thunk'
import { fetchOrganizationsConfig } from './service'
import { ConfigActions, LoadConfigActions } from './types'

export const loadOrganizationsConfig = (): ThunkAction<
  void,
  AuthReducerState,
  unknown,
  LoadConfigActions | PushGeographiesAction
> => {
  return async (dispatch, getState) => {
    await dispatch({ type: ConfigActions.LOAD_ORGANIZATION_CONFIG })
    const authToken = auth.selectors.authToken(getState())

    try {
      const data = await fetchOrganizationsConfig({ authToken })
      await dispatch({ type: ConfigActions.LOAD_ORGANIZATION_CONFIG_SUCCESS, data })

      const geographies = data.map(config => config.jurisdictions.map(j => j.geographies).flat()).flat()
      await dispatch({ type: GeographiesActions.PUSH_GEOGRAPHIES, payload: geographies })
    } catch (e) {
      await dispatch({ type: ConfigActions.LOAD_ORGANIZATION_CONFIG_FAILED })
      await dispatch(notifier.actions.displayError(`Error loading organization config`, e))
    }
  }
}
