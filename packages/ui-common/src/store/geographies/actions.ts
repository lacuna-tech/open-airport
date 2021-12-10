import { ThunkAction } from 'redux-thunk'
import { Geography, UUID } from '@mds-core/mds-types'
import { selectors as authSelectors, AuthReducerState } from '../auth/auth'
import { mdsGeography } from '../../service'

import { LoadState, ThunkedPromise } from '../../util'
import { GeographiesActions, DeleteGeographyAction, RequestGeographiesActions, GeographyReducerState } from './types'
import notifier from '../notifier/notifier'
import { selectors } from './selectors'

/**
 * Load all geographies for this agency.
 */
const getGeographies = <T extends AuthReducerState & GeographyReducerState>(): ThunkAction<
  void,
  T,
  unknown,
  RequestGeographiesActions
> => {
  return async (dispatch, getState) => {
    const { selectGeographyState } = selectors
    const { loaded } = selectGeographyState(getState())

    // While we're only getting ALL geographies, we only need to get them once.
    if (loaded === LoadState.unloaded) {
      try {
        const authToken = authSelectors.authToken(getState())
        dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_STARTED })
        const {
          data: { geographies }
        } = await mdsGeography.fetchGeographies({ authToken })
        dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_SUCCESS, payload: { geographies } })
      } catch (error) {
        dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE })
        dispatch(notifier.actions.displayError('Error loading geographies', error))
      }
    }
  }
}

const createGeography = <StateType extends AuthReducerState>(
  geography: Geography
): ThunkedPromise<Geography, StateType, RequestGeographiesActions> => {
  return async (dispatch, getState) => {
    try {
      const authToken = authSelectors.authToken(getState())
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_STARTED })
      const result = await mdsGeography.createGeography(geography, { authToken })
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_SUCCESS, payload: { geographies: [result] } })
    } catch (error) {
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE })
      dispatch(notifier.actions.displayError('Error creating geography', error))
    }
  }
}

const updateGeography = <StateType extends AuthReducerState>(
  geography: Geography
): ThunkedPromise<Geography, StateType, RequestGeographiesActions> => {
  return async (dispatch, getState) => {
    try {
      const authToken = authSelectors.authToken(getState())
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_STARTED })
      const result = await mdsGeography.updateGeography(geography, { authToken })
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_SUCCESS, payload: { geographies: [result] } })
    } catch (error) {
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE })
      dispatch(notifier.actions.displayError('Error updating geography', error))
    }
  }
}

type DoDeleteActions = RequestGeographiesActions | DeleteGeographyAction
const deleteGeography = <StateType extends AuthReducerState>(
  geography_id: UUID
): ThunkedPromise<UUID, StateType, DoDeleteActions> => {
  return async (dispatch, getState) => {
    try {
      const authToken = authSelectors.authToken(getState())
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_STARTED })
      await mdsGeography.deleteGeography(geography_id, { authToken })
      dispatch({ type: GeographiesActions.DELETE_GEOGRAPHY, payload: { geography_id } })
      dispatch(notifier.actions.displayNotice('Geography deleted', 'success'))
    } catch (error) {
      dispatch({ type: GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE })
      dispatch(notifier.actions.displayError('Error deleting geography', error))
    }
  }
}

export const actions = {
  getGeographies,
  createGeography,
  updateGeography,
  deleteGeography
}
