import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { DateTime, Duration, Interval, Settings as DateTimeSettings } from 'luxon'
import humanizeDuration from 'humanize-duration'

import { DialogContent, DialogTitle } from '@material-ui/core'
import { DateRange, DateRangeInput, isClosedDateRange } from '../../DateRangeInput'

const useStyles = makeStyles(
  createStyles({
    container: {
      width: 360
    }
  }),
  { name: 'CustomTimeRangeDialog' }
)

export interface CustomTimeRangeDialogProps {
  id: string
  open?: boolean
  timezone?: string
  maxDuration?: Duration
  onCancel?: () => void
  onConfirm?: (customDateRange: Interval) => void
  minDate?: DateTime
  maxDate?: DateTime
}

export const CustomTimeRangeDialog: React.FunctionComponent<CustomTimeRangeDialogProps> = ({
  id,
  open = false,
  timezone = DateTimeSettings.defaultZoneName,
  maxDuration,
  onCancel,
  onConfirm,
  minDate,
  maxDate
}) => {
  const [customDateRange, setCustomDateRange] = React.useState<DateRange | null>(null)

  const [error, setError] = React.useState<string>('')
  const submit: React.FormEventHandler = event => {
    event.preventDefault()

    if (customDateRange == null || !isClosedDateRange(customDateRange)) {
      setError('both start and end dates are required')
      return
    }

    const { start, end } = customDateRange
    if (maxDuration != null && end.diff(start) > maxDuration) {
      setError(`exceeds max duration of ${humanizeDuration(maxDuration.toMillis())}`)
      return
    }

    setError('')
    onConfirm?.(Interval.fromDateTimes(start, end))
  }

  const classes = useStyles()
  return (
    <Dialog open={open}>
      <DialogTitle>Use Custom Time Range</DialogTitle>

      <form onSubmit={submit}>
        <DialogContent className={classes.container}>
          <DateRangeInput
            id={id}
            timezone={timezone}
            withTime
            value={customDateRange}
            error={Boolean(error)}
            helperText={error}
            onChange={setCustomDateRange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type='submit' variant='contained' color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
