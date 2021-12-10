import React from 'react'
import EventIcon from '@material-ui/icons/Event'
import DateTimeUtils from '@date-io/luxon'
import { DateTime } from 'luxon'
import { IconButton } from '@material-ui/core'
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers'
import { PickersProps } from './types'

export const DateTimePickers = ({
  endDateTime,
  error,
  errorMessage,
  minDate,
  minuteStep,
  setEndDateTime,
  setStartDateTime,
  startDateTime,
  useLive
}: PickersProps) => {
  return (
    <MuiPickersUtilsProvider utils={DateTimeUtils}>
      <DateTimePicker
        disabled={useLive}
        style={{ marginBottom: '8px' }}
        error={error}
        label='Start'
        disableFuture
        maxDate={endDateTime || undefined}
        showTodayButton
        format='L, LT'
        minutesStep={minuteStep}
        value={startDateTime}
        minDate={minDate.toJSDate()}
        onChange={newDate => {
          if (newDate && newDate > DateTime.now()) {
            const newValidDate = DateTime.now().minus({ minutes: 1 })
            setStartDateTime(newValidDate)
          } else {
            setStartDateTime(newDate)
          }
        }}
        InputProps={{
          startAdornment: (
            <IconButton style={{ order: 1 }}>
              <EventIcon color='disabled' fontSize='small' />
            </IconButton>
          )
        }}
      />
      <DateTimePicker
        disabled={useLive}
        error={error}
        helperText={errorMessage}
        label='End'
        showTodayButton
        format='L, LT'
        value={endDateTime}
        minDate={minDate.toJSDate()}
        minutesStep={minuteStep}
        disableFuture
        onChange={newDate => {
          if (newDate && newDate > DateTime.now()) {
            setEndDateTime(DateTime.now())
          } else {
            setEndDateTime(newDate)
          }
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
