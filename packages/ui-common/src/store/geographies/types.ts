import { Geography, UUID, GeographyMetadata } from '@mds-core/mds-types'
import { LoadState } from '../../util'

export enum GeographiesActions {
  REQUEST_GEOGRAPHIES_STARTED = 'request-geographies-started',
  REQUEST_GEOGRAPHIES_SUCCESS = 'request-geographies-success',
  REQUEST_GEOGRAPHIES_FAILURE = 'request-geographies-failure',
  CREATE_GEOGRAPHY = 'create-geography',
  UPDATE_GEOGRAPHY = 'update-geography',
  DELETE_GEOGRAPHY = 'delete-geography',
  PUSH_GEOGRAPHIES = 'push-geographies'
}

export type GeographyPayload = { geography: Geography }
export type GeographiesPayload = { geographies: Geography[] }
export type RequestGeographiesStartedAction = { type: GeographiesActions.REQUEST_GEOGRAPHIES_STARTED }
export type RequestGeographiesSuccessAction = {
  type: GeographiesActions.REQUEST_GEOGRAPHIES_SUCCESS
  payload: GeographiesPayload
}
export type RequestGeographiesFailureAction = { type: GeographiesActions.REQUEST_GEOGRAPHIES_FAILURE }
export type PushGeographiesAction = { type: GeographiesActions.PUSH_GEOGRAPHIES; payload: GeographyWithMetadata[] }

// Alias for loading state actions
export type RequestGeographiesActions =
  | RequestGeographiesStartedAction
  | RequestGeographiesSuccessAction
  | RequestGeographiesFailureAction

export type CreateGeographyAction = { type: GeographiesActions.UPDATE_GEOGRAPHY; payload: GeographyPayload }
export type UpdateGeographyAction = { type: GeographiesActions.CREATE_GEOGRAPHY; payload: GeographyPayload }
export type DeleteGeographyAction = { type: GeographiesActions.DELETE_GEOGRAPHY; payload: { geography_id: UUID } }

export type GeographyWithMetadata = Geography & Partial<GeographyMetadata>

/**
 * Domain state shape:
 * @param loaded Current load state for all geography summaries.
 * @param geographyList List of geography summaries in server-defined order.
 * @param geographyMap Map of `{ <geo.id>: Geography }` for random access.
 */
export interface GeographyState {
  loaded: LoadState
  geographyMap: { [geography_id: string]: GeographyWithMetadata }
}

// ReducerState: used to create full `AppState` shape and for selectors
export interface GeographyReducerState {
  geographyState: GeographyState
}

export const getInitialState: () => GeographyState = () => ({ loaded: LoadState.unloaded, geographyMap: {} })
