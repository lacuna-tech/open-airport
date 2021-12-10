import { GetTripsOptions, TripDomainCreateModel } from '@lacuna-core/mds-trip-backend'
import { ThunkAction } from 'redux-thunk'
import { auth, notifier } from '@lacuna/ui-common'
import { Action } from '@reduxjs/toolkit'
import { Nullable } from 'lib'
import FileSaver from 'file-saver'
import { RequestTripActions, TripActions, AppState } from './types'
import { fetchTrips, fetchTripsCsv } from './service'

const loadTrips = (
  params: GetTripsOptions,
  link: Nullable<string>
): ThunkAction<void, AppState, unknown, RequestTripActions> => {
  return async (dispatch, getState) => {
    await dispatch({ type: TripActions.LOAD_TRIPS, params })

    const authToken = auth.selectors.authToken(getState())

    try {
      const data = await fetchTrips({ authToken, params, link })
      await dispatch({ type: TripActions.LOAD_TRIPS_SUCCESS, data })
    } catch (e) {
      await dispatch({ type: TripActions.LOAD_TRIPS_FAILED })
      await dispatch(notifier.actions.displayError(`Error loading trips`, e))
    }
  }
}

const downloadTripsCsv = (params: GetTripsOptions): ThunkAction<void, AppState, unknown, Action> => {
  return async (dispatch, getState) => {
    const authToken = auth.selectors.authToken(getState())

    try {
      const { blob } = await fetchTripsCsv({ authToken, params })
      FileSaver.saveAs(blob)
    } catch (e) {
      await dispatch(notifier.actions.displayError('Error downloading trips csv:', e))
    }
  }
}

const pushFakeTrips = (fakeTrips: TripDomainCreateModel[]): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch({ type: 'push-fake-trips', fakeTrips })
  }
}

export const actions = {
  loadTrips,
  downloadTripsCsv,
  pushFakeTrips
}
