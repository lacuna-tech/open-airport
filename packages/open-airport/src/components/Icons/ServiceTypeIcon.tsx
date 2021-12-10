import React from 'react'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { SERVICE_TYPE, serviceTypeMap } from 'lib/trip'

export function ServiceTypeIcon({
  service_type,
  ...props
}: Omit<FontAwesomeIconProps, 'icon' | 'color'> & {
  service_type: SERVICE_TYPE
}) {
  const { icon } = serviceTypeMap[service_type]
  return <FontAwesomeIcon {...{ ...props, icon }} />
}
