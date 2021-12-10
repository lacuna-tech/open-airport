import { TripDomainModel } from '@lacuna-core/mds-trip-backend'
import { LoadState } from '@lacuna/ui-common'
import { createReducer } from '@reduxjs/toolkit'
import { getInitialState, LoadTripsSuccessAction, TripActions } from './types'

export const reducer = {
  tripState: createReducer(getInitialState(), {
    reset: () => getInitialState(),
    [TripActions.LOAD_TRIPS]: state => ({ ...state, loaded: LoadState.loading }),
    [TripActions.LOAD_TRIPS_FAILED]: state => ({ ...state, loaded: LoadState.error }),
    [TripActions.LOAD_TRIPS_SUCCESS]: (state, action: LoadTripsSuccessAction) => {
      return {
        ...state,
        loadState: LoadState.loaded,
        data: { ...action.data }
      }
    },
    'push-fake-trips': (state, action: { type: 'push-fake-trips'; fakeTrips: TripDomainModel[] }) => {
      const existingTrips = state.data?.trips || []
      return {
        ...state,
        loadState: LoadState.loaded,
        data: {
          trips: [...existingTrips, ...action.fakeTrips],
          links: {
            prev: null,
            next: null
          }
        }
      }
    }
  })
}
