import React from 'react'
import EventIcon from '@material-ui/icons/Event'
import DateTimeUtils from '@date-io/luxon'
import { DateTime } from 'luxon'
import { IconButton } from '@material-ui/core'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import { PickersProps } from './types'

export const DatePickers = ({
  endDateTime,
  error,
  errorMessage,
  minDate,
  setEndDateTime,
  setStartDateTime,
  startDateTime,
  useLive
}: PickersProps) => {
  return (
    <MuiPickersUtilsProvider utils={DateTimeUtils}>
      <DatePicker
        disabled={useLive}
        style={{ marginBottom: '8px' }}
        error={error}
        label='Start'
        disableFuture
        maxDate={endDateTime || undefined}
        showTodayButton
        format='L'
        value={startDateTime}
        minDate={minDate.toJSDate()}
        onChange={date => {
          const newDate = (date || DateTime.now()).startOf('day')
          setStartDateTime(newDate)
        }}
        InputProps={{
          startAdornment: (
            <IconButton style={{ order: 1 }}>
              <EventIcon color='disabled' fontSize='small' />
            </IconButton>
          )
        }}
      />
      <DatePicker
        disabled={useLive}
        error={error}
        helperText={errorMessage}
        label='End'
        showTodayButton
        format='L'
        value={endDateTime}
        minDate={minDate.toJSDate()}
        disableFuture
        onChange={date => {
          const newDate = (date ?? DateTime.now()).endOf('day')
          setEndDateTime(newDate)
        }}
        InputProps={{
          startAdornment: (
            <IconButton style={{ order: 1 }}>
              <EventIcon color='disabled' fontSize='small' />
            </IconButton>
          )
        }}
      />
    </MuiPickersUtilsProvider>
  )
}
