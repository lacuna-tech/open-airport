import { UUID } from '@mds-core/mds-types'
import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { AppState, TrayActions, TrayEventSelectedAction, TrayTripSelectedAction } from './types'

export const setSelectedEvent = ({
  id,
  relatedEventIds
}: {
  id: UUID
  relatedEventIds: UUID[]
}): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch<TrayEventSelectedAction>({
      type: TrayActions.TRAY_EVENT_SELECTED,
      data: { eventId: id, relatedEventIds }
    })
  }
}

export const clearSelectedEvent = (): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch({
      type: TrayActions.TRAY_EVENT_CLEARED
    })
  }
}

export const setSelectedTrip = ({ id }: { id: UUID }): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch<TrayTripSelectedAction>({
      type: TrayActions.TRAY_TRIP_SELECTED,
      data: { tripId: id }
    })
  }
}

export const clearSelectedTrip = (): ThunkAction<void, AppState, unknown, Action> => {
  return async dispatch => {
    await dispatch({
      type: TrayActions.TRAY_TRIP_CLEARED
    })
  }
}

export const trayActions = {
  setSelectedEvent,
  clearSelectedEvent,
  setSelectedTrip,
  clearSelectedTrip
}
