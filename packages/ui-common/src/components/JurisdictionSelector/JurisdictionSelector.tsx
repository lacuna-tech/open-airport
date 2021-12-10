/**
 * Material-UI <Select> to choose a single jurisdiction.
 * `onChange()` is called with the `jurisdiction` object.
 * Currently tuned to NOT be in react-final-form!
 *
 * NOTES:
 *  - Assumes `jurisdictions` server config is loaded BEFORE this component is rendered.
 *  - If no jurisdictions were loaded, hides the select entirely.
 *  - If there's only one jurisdiction, we'll render as non-interactive text.
 */
import React, { useMemo } from 'react'

import Select, { SelectProps } from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import { Jurisdiction } from '../../lib/jurisdiction'
import { jurisdictionStore } from '../../store'

export interface JurisdictionSelectorProps extends Omit<SelectProps, 'onChange'> {
  /** REQUIRED `onChange(jurisdiction)` method. */
  onChange: (jurisdiction: Jurisdiction) => void
  /** Title to show for jurisdiction not in the current list. */
  unknownTitle?: string
}
export default function JurisdictionSelector({
  onChange,
  unknownTitle = '(Unknown Jurisdiction)',
  ...props
}: JurisdictionSelectorProps) {
  const jurisdictions = jurisdictionStore.selectors.useJurisdictions()
  const jurisdictionItems = useMemo(() => {
    return (
      jurisdictions &&
      jurisdictions.map(({ jurisdiction_id, agency_name }) => (
        <MenuItem key={jurisdiction_id} value={jurisdiction_id}>
          {agency_name}
        </MenuItem>
      ))
    )
  }, [jurisdictions])

  // Create selectOnChange method which converts to actual Jurisdiction
  // and calls user-provided `onChange()`
  const selectOnChange: (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => void = useMemo(() => {
    return event => {
      const selected_id = event.target.value
      const jurisdiction = jurisdictions && jurisdictions.find(({ jurisdiction_id }) => jurisdiction_id === selected_id)
      if (onChange && jurisdiction) onChange(jurisdiction)
    }
  }, [jurisdictions, onChange])

  // Output "unknown" message if no jurisdictions
  if (!jurisdictions || jurisdictions.length === 0) return <span>{unknownTitle}</span>

  const valueSet = !!props.value
  const valueFound = !!jurisdictions.find(j => j.jurisdiction_id === props.value)

  // For single jurisdiction, just show agency name, ignoring `value`.
  if (jurisdictions.length === 1) {
    if (valueSet && !valueFound) return <span>{unknownTitle}</span>
    return <span>{jurisdictions[0].agency_name}</span>
  }

  return (
    <Select {...props} onChange={selectOnChange}>
      {valueSet && !valueFound && (
        <MenuItem value={props.value as string} disabled>
          {unknownTitle}
        </MenuItem>
      )}
      {jurisdictionItems}
    </Select>
  )
}
