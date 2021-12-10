import { VEHICLE_EVENT, VEHICLE_EVENTS, TNC_VEHICLE_EVENT } from '@mds-core/mds-types'

export const GEOFENCE_IDS = ['assignment', 'terminal', 'lax'] as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GEOFENCE_IDS = typeof GEOFENCE_IDS[number]

const snakeCaseToTitleCase = (str: string) =>
  str
    .split('_')
    .map(w => w[0].toUpperCase() + w.substring(1))
    .join(' ')

export const vehicleEventMap: { [key in TNC_VEHICLE_EVENT]: { label: string } } = [...TNC_VEHICLE_EVENT].reduce(
  (map, event) => ({ ...map, [event]: { label: snakeCaseToTitleCase(event) } }),
  {} as { [key in VEHICLE_EVENT]: { label: string } }
)

export const buildLabelMap = <T extends string>(type_const: readonly string[]): { [key in T]: { label: string } } =>
  [...type_const].reduce(
    (map, event) => ({ ...map, [event]: { label: snakeCaseToTitleCase(event) } }),
    {} as { [key in T]: { label: string } }
  )

export const test: { [key in VEHICLE_EVENT]: { label: string } } = buildLabelMap<VEHICLE_EVENT>(VEHICLE_EVENTS)

export const stagingLotGeo = {
  type: 'Polygon',
  coordinates: [
    [
      [-118.39382171630858, 33.95293638315135],
      [-118.39384317398071, 33.9489314989428],
      [-118.3900237083435, 33.94882469945067],
      [-118.39006662368773, 33.94743629385709],
      [-118.37998151779175, 33.947382893189626],
      [-118.38023900985716, 33.95265159761009],
      [-118.39382171630858, 33.95293638315135]
    ]
  ]
}
