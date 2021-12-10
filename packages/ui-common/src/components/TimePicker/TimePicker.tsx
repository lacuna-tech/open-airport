/**
 * Matertial-ui datepicker for setting time only.
 * Assumes it gets/sets value as a string according to `format`, Date or Timestamp.
 * Assumes it's embedded in a `react-final-form`
 * See: https://material-ui-pickers.dev/api/KeyboardTimePicker
 */
import * as React from 'react'
import { DateTime } from 'luxon'
import DateTimeUtils from '@date-io/luxon'
import { Field } from 'react-final-form'
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardTimePickerProps } from '@material-ui/pickers'

export type TimePickerProps = {
  /** passed to <Field> */
  name: string
  /** round returned date? */
  roundTo?: 'hour' | 'minute' | 'second' | false
  /** if true, we'll shrink the label */
  shrinkLabel?: boolean
  /** optional object of random props pass to <Field> */
  // fieldProps?: Partial<FieldProps<any, any>>
} & /** everything else is passed to <KeyboardTimePicker> */ Omit<KeyboardTimePickerProps, 'onChange' | 'value'>

export default function TimePicker(props: TimePickerProps) {
  const { name, roundTo, shrinkLabel, ...pickerProps } = props
  return (
    <MuiPickersUtilsProvider utils={DateTimeUtils}>
      <Field
        name={name}
        allowNull={true}
        format={(value: string) => {
          if (value) return props.format ? DateTime.fromFormat(value, props.format) : DateTime.fromISO(value)
          return null
        }}
        parse={(date: DateTime): string => {
          if (!date) return ''
          if (roundTo) date.startOf(roundTo)
          return props.format != null ? date.toFormat(props.format) : date.toISO()
        }}
        // {...fieldProps}
        render={({ input, meta }) => {
          // NOTE: can't figure out how to pass `onFocus/onBlur` to make `meta.touched` work
          // const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) && meta.touched
          const showError = !!meta.error || (meta.submitError && !meta.dirtySinceLastSubmit)
          const helperText = showError ? meta.error || meta.submitError : undefined
          const allProps: KeyboardTimePickerProps = {
            ...input,
            ...pickerProps,
            error: showError,
            helperText
          }
          if (shrinkLabel) {
            allProps.InputLabelProps = {
              ...allProps.InputLabelProps,
              shrink: true
            }
          }
          // console.warn(timePickerProps)
          return <KeyboardTimePicker {...allProps} />
        }}
      />
    </MuiPickersUtilsProvider>
  )
}

TimePicker.defaultProps = {
  roundTo: 'second',
  shrinkLabel: false,
  clearable: true,
  ampm: false,
  format: 'HH:mm:ss',
  placeholder: 'hh:mm:ss'
}
