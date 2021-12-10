import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { DateTime } from 'luxon'
import { Nullable, UUID } from '@mds-core/mds-types'
import FileSaver from 'file-saver'
import { selectors as authSelectors } from '../auth/auth'
import { selectors as eventSelectors } from './selectors'
import notifier from '../notifier/notifier'
import { fetchVehicleEvents, fetchVehicleEventsCsv } from './service'
import { AppState, GetVehicleEventsFilterParams, VehicleEventActions, VehicleEventsResponse } from './types'

const loadVehicleEvents = (
  params: GetVehicleEventsFilterParams,
  link: Nullable<string>,
  allGeographyIds?: UUID[]
): ThunkAction<void, AppState, unknown, Action> => {
  return async (dispatch, getState) => {
    await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS, params })

    const authToken = authSelectors.authToken(getState())

    const newParams = {
      ...params,
      geography_ids: params.geography_ids && params.geography_ids.length > 0 ? params.geography_ids : allGeographyIds
    }

    try {
      const data = await fetchVehicleEvents({ authToken, params: newParams, link })
      await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS_SUCCESS, data })
    } catch (e: unknown) {
      await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS_FAILED })
      await dispatch(notifier.actions.displayError(`Error loading events:`, e as Error))
    }
  }
}

const loadVehicleEventsCsv = (params: GetVehicleEventsFilterParams): ThunkAction<void, AppState, unknown, Action> => {
  return async (dispatch, getState) => {
    await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS, params })

    const authToken = authSelectors.authToken(getState())

    try {
      const { blob, filename } = await fetchVehicleEventsCsv({ authToken, params })
      FileSaver.saveAs(blob, filename)
    } catch (e: unknown) {
      await dispatch(notifier.actions.displayError('Error downloaing events csv: ', e as Error))
    }
  }
}

export const loadVehicleEventsLive = (allGeographyIds: UUID[]): ThunkAction<void, AppState, unknown, Action> => {
  return async (dispatch, getState) => {
    const { params } = eventSelectors.selectVehicleEventsState(getState())
    if (!params) {
      // eslint-disable-next-line no-console
      console.warn('Cannot load live events when params are undefined')
      return
    }

    const newTimeRange = { start: DateTime.now().minus({ minutes: 15 }).valueOf(), end: DateTime.now().valueOf() }
    const newParams = {
      ...params,
      geography_ids: params.geography_ids && params.geography_ids.length > 0 ? params.geography_ids : allGeographyIds,
      time_range: newTimeRange
    }

    await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS, silent: true, params: newParams })

    const authToken = authSelectors.authToken(getState())

    try {
      const data = await fetchVehicleEvents({ authToken, params: newParams, link: null })
      const { params: stateParams } = eventSelectors.selectVehicleEventsState(getState())
      if (stateParams !== newParams) {
        // eslint-disable-next-line no-console
        console.warn('Rejecting query response, params have changed since submit.')
        return
      }

      await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS_SUCCESS, data })
    } catch (e: unknown) {
      await dispatch({ type: VehicleEventActions.LOAD_VEHICLE_EVENTS_FAILED })
      await dispatch(notifier.actions.displayError(`Error loading events:`, e as Error))
    }
  }
}

const pushVehicleEvents = (newData: VehicleEventsResponse): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch({ type: VehicleEventActions.PUSH_VEHICLE_EVENTS, newData })
  }
}

const resetVehicleEvents = (): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch({ type: VehicleEventActions.RESET_VEHICLE_EVENTS })
  }
}

export const actions = {
  loadVehicleEvents,
  loadVehicleEventsCsv,
  loadVehicleEventsLive,
  pushVehicleEvents,
  resetVehicleEvents
}
