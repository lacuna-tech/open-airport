import { Device, Nullable, UUID } from '@mds-core/mds-types'
import { useMemo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EventAnnotationDomainModel, EventDomainModel } from '@mds-core/mds-ingest-service'
import { actions } from './actions'
import { selectors } from './selectors'
import { getEventId, GetVehicleEventsFilterParams, VehicleEventType } from './types'
import { LoadState } from '../../util'

export interface UseVehicleEvents {
  params?: GetVehicleEventsFilterParams
  events: VehicleEventType[]
  devices: { [key: string]: Device }
  silent?: boolean
  loadState: LoadState
  fetchEvents: () => void
  fetchEventsLive: () => void
  cursor: { prev: Nullable<string>; next: Nullable<string> }
}

type AnnotatedEventDomainModel = EventDomainModel & {
  annotation: Nullable<EventAnnotationDomainModel>
  geography_id?: UUID[]
}

// Fetch new events, add to redux
export const useVehicleEvents = (
  requestParams?: GetVehicleEventsFilterParams,
  allGeographyIds?: UUID[],
  link?: Nullable<string>
): UseVehicleEvents => {
  const dispatch = useDispatch()

  const fetchEvents = useCallback(() => {
    if (
      requestParams &&
      ((allGeographyIds && allGeographyIds.length > 0) ||
        (requestParams.geography_ids && requestParams.geography_ids?.length > 0))
    ) {
      dispatch(actions.loadVehicleEvents(requestParams, link ?? null, allGeographyIds))
    }
  }, [dispatch, requestParams, allGeographyIds, link])

  const fetchEventsLive = useCallback(() => {
    if (allGeographyIds && allGeographyIds.length > 0) {
      dispatch(actions.loadVehicleEventsLive(allGeographyIds))
    }
  }, [dispatch, allGeographyIds])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const state = useSelector(selectors.selectVehicleEventsState)
  const { data, loadState, silent, params } = state || {}
  const { events: rawEvents, vehicles, cursor } = data || {}

  const events = useMemo(
    () =>
      rawEvents?.map(({ provider_id, ...restEvent }: AnnotatedEventDomainModel) => {
        // create id since not available on domain model
        const id = `${restEvent.timestamp}|${restEvent.device_id}`
        const device = (vehicles && (vehicles as { [key: string]: Device })[restEvent.device_id]) || {}

        const correctedProviderId =
          provider_id === 'e714f168-ce56-4b41-81b7-0b6a4bd2612' ? 'e714f168-ce56-4b41-81b7-0b6a4bd26128' : provider_id

        return { ...restEvent, ...device, id, provider_id: correctedProviderId, cursor }
      }) as VehicleEventType[],
    [rawEvents, vehicles, cursor]
  )

  const devices = (vehicles ?? {}) as { UUID: Device }
  return {
    events,
    params,
    devices,
    cursor: cursor ?? { prev: null, next: null },
    loadState,
    silent,
    fetchEvents,
    fetchEventsLive
  }
}

export const useReduxVehicleEvents = (): { events: EventDomainModel[]; loadState: LoadState } => {
  const state = useSelector(selectors.selectVehicleEventsState)
  const { data, loadState } = state || {}
  const { events: rawEvents, vehicles } = data || {}

  const events =
    rawEvents?.map(event => {
      const device = (vehicles && (vehicles as { [key: string]: Device })[event.device_id]) || {}
      const id = getEventId(event)
      return { ...event, ...device, id }
    }) || []

  return { events, loadState }
}
