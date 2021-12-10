import React from 'react'
import ChipSelect, { ChipSelectProps } from '../ChipSelect/ChipSelect'
import { hooks } from '../../store/geographies/index'

export type GeographiesSelectProps = Omit<ChipSelectProps, 'options'>
export default function GeographiesSelect(props: GeographiesSelectProps) {
  const geographyList = hooks.useActiveGeographyList()
  const options = React.useMemo(
    () =>
      geographyList.map(geography => {
        return { value: geography.geography_id, label: geography.name }
      }),
    [geographyList]
  )
  return <ChipSelect options={options} {...props} />
}
