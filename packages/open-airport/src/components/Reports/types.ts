export const GRAPH_TYPES = [
  'average_connect_time',
  'average_dwell_time',
  'events_by_type',
  'pudo_vs_enter_exit',
  'total_fees',
  'total_trips',
  'vehicle_state_by_type'
] as const
export type GRAPH_TYPE = typeof GRAPH_TYPES[number]

export const TIME_COMPARATOR_TYPES = ['today_yesterday', 'today_last_week', 'hour_last_week'] as const
export type TIME_COMPARATOR_TYPE = typeof TIME_COMPARATOR_TYPES[number]

export const CHART_TYPES = ['line', 'bar', 'table'] as const
export type CHART_TYPE = typeof CHART_TYPES[number]
