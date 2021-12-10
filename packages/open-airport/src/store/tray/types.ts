import { AuthReducerState } from '@lacuna/ui-common'

export enum TrayActions {
  TRAY_EVENT_SELECTED = 'tray-event-selected',
  TRAY_EVENT_CLEARED = 'tray-event-cleared',
  TRAY_TRIP_SELECTED = 'tray-trip-selected',
  TRAY_TRIP_CLEARED = 'tray-trip-cleared'
}

export type TrayEventSelectedAction = {
  type: TrayActions.TRAY_EVENT_SELECTED
  data: { eventId: string; relatedEventIds: string[] }
}

export type EventTrayState = {
  eventId: string | undefined
  relatedEventIds: string[]
}

export type TripTrayState = {
  tripId: string | undefined
}

export type TrayTripSelectedAction = {
  type: TrayActions.TRAY_TRIP_SELECTED
  data: { tripId: string }
}
export interface TrayState {
  eventTray: EventTrayState
  tripTray: TripTrayState
}

export const getInitialState: () => TrayState = () => ({
  eventTray: {
    eventId: undefined,
    relatedEventIds: []
  },
  tripTray: {
    tripId: undefined
  }
})

export interface TrayReducerState {
  trayState: TrayState
}

export type AppState = TrayReducerState & AuthReducerState
