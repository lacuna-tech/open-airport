import * as React from 'react'
import { DateTime, Settings as DateTimeSettings } from 'luxon'
import DateTimeUtils from '@date-io/luxon'
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'

export type DateTimeInputProps = {
  id: string
  label?: string
  value?: DateTime | null
  name?: string
  minDate?: DateTime
  maxDate?: DateTime
  timezone?: string
  withTime?: boolean
  disabled?: boolean
  error?: boolean
  helperText?: string
  onChange?(value: DateTime | null): void
}

const DATE_FORMAT = 'LL/dd/yyyy'
const TIME_FORMAT = 'hh:mm a'
const DATE_MASK = '__/__/____'
const TIME_MASK = '__:__ _m'
const DATE_PLACEHOLDER = '01/01/2000'
const TIME_PLACEHOLDER = '12:59 pm'

export const DateTimeInput: React.FunctionComponent<DateTimeInputProps> = ({
  id,
  label,
  value,
  name,
  minDate,
  maxDate,
  timezone = DateTimeSettings.defaultZoneName,
  withTime = false,
  disabled = false,
  error = false,
  helperText = '',
  onChange
}: DateTimeInputProps) => {
  const PickerComponent = withTime ? KeyboardDateTimePicker : KeyboardDatePicker
  const mask = withTime ? `${DATE_MASK} ${TIME_MASK}` : DATE_MASK
  const placeholder = withTime ? `${DATE_PLACEHOLDER} ${TIME_PLACEHOLDER}` : DATE_PLACEHOLDER
  const format = withTime ? `${DATE_FORMAT} ${TIME_FORMAT}` : DATE_FORMAT

  // NOTE: We'll only call onChange if the entered date is valid to avoid lots of renreders
  //       during user typing. This means that we have to maintain the raw input value
  //       state and update it separately from the parsed date value.
  const formattedValue = value?.toFormat(format) || ''
  const [inputValue, setInputValue] = React.useState(formattedValue)
  // Keep the internal input value updated with any props changes.
  React.useEffect(() => {
    setInputValue(formattedValue)
  }, [formattedValue])
  const updateDate = React.useCallback(
    (date: DateTime | null, rawValue: string | null | undefined) => {
      setInputValue(rawValue || '')
      // Don't call onChange if the user entered an invalid date
      if (date && !date.isValid) {
        return
      }
      // Ensure that we convert the entered date to the timezone
      // of the component, keeping the local time that the user
      // entered.
      let newDate = date?.setZone(timezone, { keepLocalTime: true })
      // Strip the time component from the date (set to T00:00:00.000)
      // if withTime isn't specified.
      if (!withTime) {
        newDate = newDate?.startOf('day')
      }
      onChange?.(newDate || null)
    },
    [onChange, timezone, withTime]
  )

  const tzAbbr = (value ?? DateTime.now()).setZone(timezone).toFormat('ZZZZ')
  // KLUDGE: material pickers will not display internal errors (like invalid format) if the
  // error or helperText props in the keys of props (passing undefined doesn't resolve this).
  // So to continue supporting internal error messages and allowing for overriding via the error
  // prop we dynamically define the props and spread them in if error is present.
  const errorProps = {} as { error?: true; helperText?: string }
  if (error) {
    errorProps.error = true
  }
  if (helperText) {
    errorProps.helperText = helperText
  }
  return (
    <MuiPickersUtilsProvider utils={DateTimeUtils}>
      <PickerComponent
        {...errorProps}
        id={id}
        label={label ? `${label} (${tzAbbr})` : `(${tzAbbr})`}
        InputLabelProps={{
          htmlFor: id
        }}
        fullWidth
        inputValue={inputValue}
        placeholder={placeholder}
        value={value || null}
        name={name}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        mask={mask}
        disabled={disabled}
        onChange={updateDate}
      />
    </MuiPickersUtilsProvider>
  )
}
