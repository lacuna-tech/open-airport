/**
 * All Metric types in one place
 * */
import { UUID, Timestamp, Nullable } from '@mds-core/mds-types'

/**
 *  MetricValue -- output values for particular metrics.
 */
export interface IntegerMap {
  [key: number]: number
}
export type MetricValue = number | number[] | IntegerMap | string | Date | null

/**
 * Constants for use in the below.
 */

/** Legal bin_sizes */
export type BinSize = 'hour' | 'day' | 'month' | 'year' // 'PT0S' | 'PT15M' |

/** Legal vehicle types. */
export const VehicleTypes = ['scooter', 'bicycle', 'tnc']

/**
 * 'Slice' of metrics values as recorded in the database.
 * We'll generally get one row per:
 *  - start_time
 *  - bin_size
 *  - provider_id
 *  - vehicle_type
 *  - geography (eventually)
 */
export interface MetricSlice {
  /** Internal database row id (not used by front end). */
  id?: number
  /** Timestamp for start of bin (currently hourly bins). */
  start_time: Timestamp
  /** A human readable format of the timestamp for taget timezne */
  start_time_formatted?: string
  /** Bin size. */
  bin_size: BinSize

  /** Geography this row applies to.  `null` = the entire organization. */
  geography: UUID | null
  /** Stop ID this row applies to. `null` = all stops */
  stop_id: UUID | null
  /** Spot ID this row applies to.  `null` = all spots. */
  spot_id: UUID | null
  /** Serice provider id */
  provider_id: UUID
  /** Vehicle type. */
  vehicle_type: typeof VehicleTypes[number]

  /** Number of events registered within the bin, by type. */
  event_counts: {
    trip_start: number
    trip_end: number
    trip_enter: number
    trip_leave: number
    telemetry: number
    // Note: below are currently unused by front-end.
    service_start: number
    user_drop_off: number
    provider_drop_off: number
    cancel_reservation: number
    reserve: number
    service_end: number
    register: number
    provider_pick_up: number
    agency_drop_off: number
    default: number
    deregister: number
    agency_pick_up: number
  }

  vehicle_counts: {
    /** Total number of registered vehicles at start of bin. */
    registered: number
    /** Total number of vehicles in the right-of-way at start of bin (available, reserved, trip). */
    deployed: number
    /** Number of vehicles in the right-of-way with 0 charge at start of bin. */
    dead: number
  }

  /** Number of trips in region, derived from distinct trip ids. */
  trip_count: number

  /** Number of vehicles with: [0 trips, 1 trip, 2 trips, ...] during bin. */
  vehicle_trips_counts: IntegerMap

  /** Number of events which out of compliance with time SLA. */
  event_time_violations: {
    /** Number of trip_start and trip_end events out of compliance with time SLA. */
    start_end: {
      /** Total number of events out of SLA compliance during bin. */
      count: number
      /** Minimum time value recorded during bin. */
      min: number
      /** Maximum time value recorded during bin. */
      max: number
      /** Average time value for all events during bin. */
      average: number
    }
    /** Number of trip_enter and trip_leave events out of compliance with time SLA. */
    enter_leave: { count: number; min: number; max: number; average: number }
    /** Number of telemetry events out of compliance with time SLA. */
    telemetry: { count: number; min: number; max: number; average: number }
  }

  /** Number of telemetry events out of compliance with distance SLA. */
  telemetry_distance_violations: {
    /** Total number of events out of SLA compliance during bin. */
    count: number
    /** Minimum distance value recorded during bin. */
    min: number
    /** Maximum distance value recorded during bin. */
    max: number
    /** Average distance value for all events during bin. */
    average: number
  }

  /** Number of event anomalies. */
  bad_events: {
    /** Number of invalid events (not matching event state machine). */
    invalid_count: number
    /** Number of duplicate events submitted. */
    duplicate_count: number
    /** Number of out-of-order events submitted (according to state machine). */
    out_of_order_count: number
  }

  /** SLA values used in these calculations, as of start of bin. */
  sla: {
    /** vehicles: Maximum number of deployed vehicles for provider. Comes from Policy rules. */
    max_vehicle_cap: number // Typical SLA: 500-2000 vehicles
    /** vehicles: Minimum number of registered vehicles for provider. */
    min_registered: number // Typical SLA: 100 vehicles
    /** events: Minumum number of trip_start events per day. */
    min_trip_start_count: number // Typical SLA: 100 events
    /** events: Minumum number of trip_end events per day. */
    min_trip_end_count: number // Typical SLA: 100 events
    /** events: Minumum number of telemetry events per day. */
    min_telemetry_count: number // Typical SLA: 1000 events (??? confirm with Joan)
    /** seconds: Maximum time between trip_start or trip_end event and submission to server. */
    max_start_end_time: number // Typical SLA: 30 seconds
    /** seconds: Maximum time between trip_enter or trip_leave event and submission to server. */
    max_enter_leave_time: number // Typical SLA: 30 seconds
    /** seconds: Maximum time between telemetry event and submission to server. */
    max_telemetry_time: number // Typical SLA: 1680 seconds
    /** meters: Maximum distance between telemetry events when on-trip. */
    max_telemetry_distance: number // Typical SLA: 100 meters
    max_avg_dwell_time: number
  }

  shared_trip_count: number
  total_fees: number
  avg_wait_time: number
  avg_dwell_time: number
  utilized_vehicle_percent: number
  curb_upgrades: number
}

/** Build a Metric Slice with some minimal seed info. */
export const BuildMetricSlice: (options: {
  start_time: number
  bin_size: BinSize
  provider_id: UUID
  vehicle_type: string
  geography: Nullable<UUID>
}) => MetricSlice = ({ start_time, bin_size, provider_id, vehicle_type, geography }) => ({
  start_time,
  bin_size,
  geography,
  provider_id,
  vehicle_type,
  stop_id: null,
  spot_id: null,

  event_counts: {
    trip_start: 0,
    trip_end: 0,
    trip_enter: 0,
    trip_leave: 0,
    telemetry: 0,
    service_start: 0,
    user_drop_off: 0,
    provider_drop_off: 0,
    cancel_reservation: 0,
    reserve: 0,
    service_end: 0,
    register: 0,
    provider_pick_up: 0,
    agency_drop_off: 0,
    default: 0,
    deregister: 0,
    agency_pick_up: 0
  },

  vehicle_counts: {
    registered: 0,
    deployed: 0,
    dead: 0
  },

  trip_count: 0,

  vehicle_trips_counts: {},

  event_time_violations: {
    start_end: {
      count: 0,
      min: 0,
      max: 0,
      average: 0
    },
    enter_leave: { count: 0, min: 0, max: 0, average: 0 },
    telemetry: { count: 0, min: 0, max: 0, average: 0 }
  },

  telemetry_distance_violations: {
    count: 0,
    min: 0,
    max: 0,
    average: 0
  },

  bad_events: {
    invalid_count: 0,
    duplicate_count: 0,
    out_of_order_count: 0
  },

  sla: {
    max_vehicle_cap: 0,
    min_registered: 0,
    min_trip_start_count: 0,
    min_trip_end_count: 0,
    min_telemetry_count: 0,
    max_start_end_time: 0,
    max_enter_leave_time: 0,
    max_telemetry_time: 0,
    max_telemetry_distance: 0,
    max_avg_dwell_time: 0
  },

  shared_trip_count: 0,
  total_fees: 0,
  avg_wait_time: 0,
  avg_dwell_time: 0,
  utilized_vehicle_percent: 0,
  curb_upgrades: 0
})

/** Build a synthetic set of Metric Slices for all combinations of provider id and vehicle type for minimal seed info.
 * Example Input: { vehicleTypes: ['bike', 'scooter'], provider_ids: [ 'a', 'b' ], start_time, bin_size }
 * Example Output: [
 *   { provider_id: 'a',  vehicle_type: 'bike', start_time, bin_size, ...  },
 *   { provider_id: 'a',  vehicle_type: 'scooter', start_time, bin_size, ...  },
 *   { provider_id: 'b',  vehicle_type: 'bike', start_time, bin_size, ...  },
 *   { provider_id: 'b',  vehicle_type: 'scooter', start_time, bin_size, ...  },
 * ]
 */
export const BuildSythenticMetricSliceSet: (options: {
  vehicle_types: string[]
  provider_ids: UUID[]
  start_time: number
  bin_size: BinSize
}) => MetricSlice[] = ({ vehicle_types, provider_ids, start_time, bin_size }) => {
  return vehicle_types.reduce<MetricSlice[]>(
    (set, vehicle_type) => [
      ...set,
      ...provider_ids.map(provider_id =>
        BuildMetricSlice({ start_time, bin_size, provider_id, vehicle_type, geography: null })
      )
    ],
    []
  )
}

/** Generic modifier to make nested data structures recursively `Partial` */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>
}

/** MetricSlice with all parameters optional */
export type PartialMetricSlice = DeepPartial<MetricSlice>

/**
 *  Calculations to get a MetricValue from a MetricSlice
 */

/** Given a MetricSlice instance, perform some calculation to return a single numeric value. */
export interface MetricCalculation {
  (bin: MetricSlice): MetricValue
}

/** Given a PARTIAL MetricSlice instance, perform some calculation to return a single numeric value. */
export interface PartialMetricCalculation {
  (bin: Partial<MetricSlice>): MetricValue
}

/**
 *  Aggregation functions
 */

/** Possible aggregator functions for a list of values.  */
export type MetricAggregators =
  | 'none'
  | 'first'
  | 'sum'
  | 'average'
  | 'smallest'
  | 'largest'
  | 'sumIntegerMaps'
  | 'averageIntegerMaps'
  | MetricValueAggregator

export interface MetricValueAggregator {
  (values: MetricValue[]): MetricValue
}

export interface MetricSliceFilter {
  (bin: MetricSlice): boolean
}

/**
 * Value structure for a single `metric` from a `MetricSlice` or aggregated from a `MetricSet`.
 * See `MetricDataSet`
 */
export interface MetricDataPoint {
  /** `start_time` of the slice the datum came from. */
  start_time: number
  /** Aggregated raw value. */
  value: MetricValue
  /** key for the datum in its MetricDataSet. Skipped if `key` is `start_time`. */
  key?: string
  /** Aggregated SLA value. */
  slaValue?: MetricValue
  /** Is the value in violation of the SLA */
  violation?: boolean
}
