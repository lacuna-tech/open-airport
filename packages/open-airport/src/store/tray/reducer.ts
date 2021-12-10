import { createReducer } from '@reduxjs/toolkit'
import { getInitialState, TrayEventSelectedAction, TrayActions, TrayTripSelectedAction } from './types'

export const reducer = {
  trayState: createReducer(getInitialState(), {
    [TrayActions.TRAY_EVENT_SELECTED]: (state, action: TrayEventSelectedAction) => {
      const {
        data: { eventId, relatedEventIds }
      } = action

      return {
        ...state,
        eventTray: {
          eventId,
          relatedEventIds
        }
      }
    },
    [TrayActions.TRAY_EVENT_CLEARED]: state => {
      return {
        ...state,
        eventTray: {
          eventId: undefined,
          relatedEventIds: []
        }
      }
    },
    [TrayActions.TRAY_TRIP_SELECTED]: (state, action: TrayTripSelectedAction) => {
      const {
        data: { tripId }
      } = action
      return {
        ...state,
        tripTray: {
          tripId
        }
      }
    },
    [TrayActions.TRAY_TRIP_CLEARED]: state => {
      return {
        ...state,
        tripTray: {
          tripId: undefined
        }
      }
    }
  })
}
