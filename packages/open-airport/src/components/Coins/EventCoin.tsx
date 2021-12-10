import React from 'react'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { vehicleStateMap_v1_1 } from 'lib/trip'
import { EventDomainModel } from '@mds-core/mds-ingest-service'
import { VEHICLE_STATE } from '@mds-core/mds-types'
import { IconCoin } from './IconCoin'

const { providerMap } = AirportConsoleConfig

export const EventCoin = ({ event, size }: { event: EventDomainModel; size?: number }) => {
  const { provider_id, vehicle_state } = event

  const { icon, map: overrides } = vehicleStateMap_v1_1[vehicle_state as VEHICLE_STATE].icon
  return (
    <IconCoin
      {...{
        shape: 'circle',
        strokeWidth: 37,
        icon,
        overrides,
        size: size || 15,
        fillColor: providerMap[provider_id].colorPalette[500],
        borderColor: '#fff',
        onClick: () => null
      }}
    />
  )
}
