import { UUID, Timestamp, TRIP_STATE, TripMetadata, VEHICLE_STATE } from '@mds-core/mds-types'
import {
  IconDefinition,
  faUsers,
  faUser,
  faPlaneArrival,
  faPlaneDeparture,
  faTicketAlt,
  faHandPaper,
  faPlay,
  faStop,
  faLightbulbOn
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faUserDollar } from 'types/custom-icons'
import { AgencyKey } from '@lacuna/agency-config'
import { FEE_TYPE } from '@mds-core/mds-transaction-service'
import { TripDomainModel } from '@lacuna-core/mds-trip-backend'

export interface TripState {
  trip_id: UUID
  trip_state: TRIP_STATE | null
  events: EnrichedTripEvent[]
}

export interface OATrip extends Omit<TripDomainModel, 'fees'>, TripMetadata {
  trip_events_log: EventDomainModel[]
  trip_duration: number
}
export type DeviceSessionsMap = { [key in AgencyKey]: DeviceState[] }

export interface DeviceState {
  // Static information gathered from first event that doesn't change
  provider_id: UUID
  device_id: UUID
  vehicle_id: string
  service_type?: SERVICE_TYPE
  transaction_type?: TRANSACTION_TYPE

  // Volatile information that can change from event to event
  vehicle_state: VEHICLE_STATE
  // The expired_timestamp is set when a signal has occured
  // that the vehicle is leaving the airport. This is set with
  // a timestamp 10 seconds in the future. Once elapsed, it should
  // no longer be shown on the map.
  expired_timestamp?: number
  curbStatus: CurbStatus
  visible?: boolean // Whether or not the device should be fed into the map component
  trips: TripState[]
  events: EnrichedVehicleEvent[]
  timestamp: number // The most recent latest timestamp of all events
}

// ----------------------------------

/** ------------- Start Replace With Import From LacunaMds Ingest ------------- */

export declare type Nullable<T> = T | null

export const VEHICLE_EVENTS = ['service_start', 'service_end'] as const
export type VEHICLE_EVENT = typeof VEHICLE_EVENTS[number]

export const TRIP_EVENTS = [
  'reserve',
  'cancel_reservation',
  'reserve_stop',
  'trip_start',
  'trip_resume',
  'trip_stop',
  'trip_end'
] as const
export type TRIP_EVENT = typeof TRIP_EVENTS[number]

export const EVENT_TYPES = [...VEHICLE_EVENTS, ...TRIP_EVENTS] as const
export type EVENT_TYPE = typeof EVENT_TYPES[number]

export const TRANSACTION_TYPES = ['pick_up', 'drop_off'] as const
export type TRANSACTION_TYPE = typeof TRANSACTION_TYPES[number]

export const SERVICE_TYPES = ['standard', 'shared', 'luxury'] as const
export type SERVICE_TYPE = typeof SERVICE_TYPES[number]

export interface TelemetryDomainModel {
  provider_id: UUID
  device_id: UUID
  timestamp: Timestamp
  recorded: Timestamp
  gps: {
    lat: Nullable<number>
    lng: Nullable<number>
    speed: Nullable<number>
    heading: Nullable<number>
    hdop: Nullable<number>
    altitude: Nullable<number>
    satellites: Nullable<number>
  }
}

export interface EventDomainModel {
  event_id: UUID
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
  timestamp: Timestamp
  recorded: Timestamp
  event_type: EVENT_TYPE
  telemetry: Nullable<Omit<TelemetryDomainModel, 'provider_id' | 'device_id' | 'timestamp' | 'recorded'>>
  trip_id: Nullable<UUID>
  stop_id: Nullable<UUID>
  spot_id: Nullable<UUID>
  service_type: Nullable<SERVICE_TYPE>
  transaction_type: Nullable<TRANSACTION_TYPE>
  vehicle_state: Nullable<VEHICLE_STATE>
  trip_state: Nullable<TRIP_STATE>
}

export interface VehicleEvent extends EventDomainModel {
  event_type: VEHICLE_EVENT
}

export interface TripEvent extends EventDomainModel {
  event_type: TRIP_EVENT
  trip_id: UUID
  service_type: SERVICE_TYPE
  transaction_type: TRANSACTION_TYPE
}

/** ------------- End Replace With Import From LacunaMds Ingest ------------- */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EnrichedEvent extends EventDomainModel {}

/** Picking the symbolizing props of the Event */
export type EventSymbol = Pick<EnrichedEvent, 'vehicle_state' | 'provider_id'>
export type IdentifiableEventSymbol = Pick<EnrichedEvent, 'event_id'> & EventSymbol

export type EnrichedTripEvent = Omit<TripEvent, 'vehicle_state'> & {
  event_id: UUID
  dwell_time?: number
  wait_time?: number
  vehicle_state: VEHICLE_STATE
}

export type EnrichedVehicleEvent = Omit<VehicleEvent, 'vehicle_state'> & {
  event_id: UUID
  vehicle_state: VEHICLE_STATE
}

export const isTripEvent = (event: EventDomainModel): event is TripEvent => {
  return TRIP_EVENTS.includes(event.event_type as TRIP_EVENT)
}

export const isVehicleEvent = (event: EventDomainModel): event is VehicleEvent => {
  return VEHICLE_EVENTS.includes(event.event_type as VEHICLE_EVENT)
}

export const isEnrichedTripEvent = (event: EventDomainModel): event is EnrichedTripEvent => {
  return TRIP_EVENTS.includes(event.event_type as TRIP_EVENT)
}

export const isEnrichedVehicleEvent = (event: EventDomainModel): event is EnrichedVehicleEvent => {
  return VEHICLE_EVENTS.includes(event.event_type as VEHICLE_EVENT)
}

export type CurbStatus = 'at-curb' | 'leaving-curb' | 'unknown'

export const serviceTypeMap: {
  [key in SERVICE_TYPE]: { label: string; service_type: SERVICE_TYPE; icon: IconDefinition }
} = {
  standard: { label: 'Standard ride', service_type: 'standard', icon: faUser },
  shared: { label: 'Shared ride', service_type: 'shared', icon: faUsers },
  luxury: { label: 'Luxury ride', service_type: 'luxury', icon: faUserDollar }
}

export const transactionTypeMap: {
  [key in TRANSACTION_TYPE]: { label: string; transaction_type: TRANSACTION_TYPE; icon: IconDefinition }
} = {
  pick_up: { label: 'Pick-Up', transaction_type: 'pick_up', icon: faPlaneArrival },
  drop_off: { label: 'Drop-Off', transaction_type: 'drop_off', icon: faPlaneDeparture }
}

export const feeTypeMap: {
  [key in FEE_TYPE]: { label: string; fee_type: FEE_TYPE }
} = {
  base_fee: { label: 'Base', fee_type: 'base_fee' },
  upgrade_fee: { label: 'Curb Upgrade', fee_type: 'upgrade_fee' },
  congestion_fee: { label: 'Congestion Fee', fee_type: 'congestion_fee' },
  trip_fee: { label: 'Trip Fee', fee_type: 'trip_fee' },
  parking_fee: { label: 'Parking Fee', fee_type: 'parking_fee' },
  reservation_fee: { label: 'Reservation Fee', fee_type: 'reservation_fee' },
  distance_fee: { label: 'Distance Fee', fee_type: 'distance_fee' },
  tolls_fee: { label: 'Tolls Fee', fee_type: 'tolls_fee' }
}

export type IconOverrides = Pick<FontAwesomeIconProps, 'transform' | 'width' | 'height'> & {
  scale?: number
}
export interface IconSettings {
  icon: IconProp
  map: IconOverrides
  track: IconOverrides
}

export const vehicleStateMap_v1_1: {
  [key in Partial<VEHICLE_STATE>]: {
    label: string
    icon: IconSettings
  }
} = {
  available: {
    label: 'Available',
    icon: { icon: faLightbulbOn, map: { transform: 'left-2 shrink-8' }, track: { transform: { x: 6.75, y: 6.25 } } }
  },
  reserved: {
    label: 'Reserved',
    icon: {
      icon: faTicketAlt,
      map: { transform: 'rotate--45 left-1 shrink-8' },
      track: { transform: { x: 6, y: 5.5, rotate: -45 } }
    }
  },
  stopped: {
    label: 'Stopped',
    icon: { icon: faHandPaper, map: { transform: 'right-0.5 shrink-8' }, track: { transform: { x: 4.5, y: 4.5 } } }
  },
  on_trip: {
    label: 'On Trip',
    icon: {
      icon: faPlay,
      map: { transform: 'shrink-8 right-2' },
      track: { transform: { x: 8, y: 6 }, width: 11, height: 11 }
    }
  },
  unknown: {
    label: 'Unknown',
    icon: {
      icon: faStop,
      map: { transform: 'shrink-8 right-1' },
      track: { transform: { x: 8, y: 8 }, width: 10, height: 10 }
    }
  },
  elsewhere: {
    label: 'Elsewhere',
    icon: {
      icon: faStop,
      map: { transform: 'shrink-8 right-1' },
      track: { transform: { x: 8, y: 8 }, width: 10, height: 10 }
    }
  },
  non_operational: {
    label: 'Non Operational',
    icon: {
      icon: faStop,
      map: { transform: 'shrink-8 right-1' },
      track: { transform: { x: 8, y: 8 }, width: 10, height: 10 }
    }
  },
  removed: {
    label: 'Removed',
    icon: {
      icon: faStop,
      map: { transform: 'shrink-8 right-1' },
      track: { transform: { x: 8, y: 8 }, width: 10, height: 10 }
    }
  }
}

export const tripStateMap: {
  [key in TRIP_STATE]: {
    label: string
  }
} = {
  on_trip: {
    label: 'On Trip'
  },
  reserved: {
    label: 'Reserved'
  },
  stopped: {
    label: 'Stopped'
  }
}

export type Coordinates = number[]

export const transactionTypeVehicleStateCurbStatusMap: {
  // eslint-disable-next-line
  [key in TRANSACTION_TYPE]: { [key in EVENT_TYPE]: CurbStatus }
} = {
  pick_up: {
    service_start: 'unknown',
    reserve: 'unknown',
    cancel_reservation: 'unknown',
    reserve_stop: 'at-curb',
    trip_start: 'leaving-curb',
    trip_resume: 'unknown',
    trip_stop: 'unknown',
    trip_end: 'unknown',
    service_end: 'unknown'
  },
  drop_off: {
    service_start: 'unknown',
    reserve: 'unknown',
    cancel_reservation: 'unknown',
    reserve_stop: 'unknown',
    trip_start: 'unknown',
    trip_resume: 'unknown',
    trip_stop: 'at-curb',
    trip_end: 'leaving-curb',
    service_end: 'unknown'
  }
}

export const getCurbStatus = ({
  transaction_type,
  event_type
}: {
  transaction_type: TRANSACTION_TYPE
  event_type: EVENT_TYPE
}) => transactionTypeVehicleStateCurbStatusMap[transaction_type][event_type]

export const transactionTypeEventsMap: {
  [key in TRANSACTION_TYPE]: { event_type: EVENT_TYPE; vehicle_state: VEHICLE_STATE }[]
} = {
  pick_up: [
    { event_type: 'service_start', vehicle_state: 'available' },
    { event_type: 'reserve', vehicle_state: 'reserved' },
    { event_type: 'reserve_stop', vehicle_state: 'stopped' },
    { event_type: 'trip_stop', vehicle_state: 'stopped' },
    { event_type: 'trip_end', vehicle_state: 'unknown' }
  ],
  drop_off: [
    { event_type: 'reserve', vehicle_state: 'reserved' },
    { event_type: 'reserve_stop', vehicle_state: 'stopped' },
    { event_type: 'trip_stop', vehicle_state: 'stopped' },
    { event_type: 'trip_end', vehicle_state: 'unknown' }
  ]
}
