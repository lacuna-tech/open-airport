import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { DateTime, Settings as DateTimeSettings } from 'luxon'

import { DateTimeInput } from '../DateTimeInput'

import { DateRange } from './types'
import { useDateRangeInput } from './useDateRangeInput'

const useStyles = makeStyles(
  theme =>
    createStyles({
      root: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: -theme.spacing(1)
      },
      inputWrapper: {
        width: '100%',
        padding: theme.spacing(1)
      }
    }),
  {
    name: 'DateRangeInput'
  }
)

export interface DateRangeInputProps {
  id: string
  name?: string
  value?: DateRange | null
  disabled?: boolean
  withLiveToggle?: boolean
  timezone?: string
  withTime?: boolean
  minDate?: DateTime
  maxDate?: DateTime
  error?: boolean
  helperText?: string
  onChange?: (value: DateRange | null) => void
}

export const DateRangeInput: React.FunctionComponent<DateRangeInputProps> = ({
  id,
  name,
  value,
  disabled,
  timezone = DateTimeSettings.defaultZoneName,
  withTime = false,
  minDate,
  maxDate,
  error = false,
  helperText = '',
  onChange
}) => {
  const { actions } = useDateRangeInput({ value: value ?? null, timezone, withTime, onChange })
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.inputWrapper}>
        <DateTimeInput
          id={`${id}.start`}
          value={value?.start}
          disabled={disabled}
          timezone={timezone}
          withTime={withTime}
          label='Start'
          name={name ? `${name}.start` : undefined}
          minDate={minDate}
          maxDate={maxDate}
          error={error}
          onChange={actions.updateStart}
        />
      </div>

      <div className={classes.inputWrapper}>
        <DateTimeInput
          id={`${id}.end`}
          value={value?.end}
          disabled={disabled}
          timezone={timezone}
          withTime={withTime}
          label='End'
          name={name ? `${name}.end` : undefined}
          minDate={minDate}
          maxDate={maxDate}
          error={error}
          helperText={helperText}
          onChange={actions.updateEnd}
        />
      </div>
    </div>
  )
}
