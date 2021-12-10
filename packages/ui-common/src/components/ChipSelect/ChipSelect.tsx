/**
 * Select component which renders multiple items with Material-UI `chips`.
 * Assumes it's being used in a `react-final-form`.
 * TODO: move to ui-common
 */
import React from 'react'
import { Field } from 'react-final-form'
import { Chip, createStyles, makeStyles, MenuItem, TextField } from '@material-ui/core'
import { StandardTextFieldProps } from '@material-ui/core/TextField'

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    select: {
      whiteSpace: 'normal'
    },
    chip: {
      margin: 2
    }
  }))

type ChipSelectOption = { value: string; label: string } | string
export type ChipSelectProps = {
  /** `[{ value, label }]` or `value[]` used to generate options and chips.  */
  options: ChipSelectOption[]
  /** Select multiple values?  Passed to <TextField inputProps/>  */
  multiple?: boolean
  /** Placeholder text to show if nothing selected */
  placeholder?: string
  /** Field name.  Passed to <Field> */
  name: string
  /** Allow null values (vs empty string)? Passed to <Field> */
  allowNull?: boolean
} & /** everything else is passed to <TextField> */ StandardTextFieldProps

export default function ChipSelect(props: ChipSelectProps) {
  const classes = useStyles()
  const { options, name, placeholder, allowNull, multiple = false, inputProps, ...textFieldProps } = props

  // Normalize options and get MenuItems for select,
  // only updating when `options` changes
  const { normalizedOptions, menuItems } = React.useMemo(() => {
    const normalized = options.map(option => {
      if (typeof option !== 'string') return option
      return { label: option, value: option }
    })
    const items = normalized.map((option, index) => {
      return (
        <MenuItem key={index} value={option.value}>
          {option.label}
        </MenuItem>
      )
    })
    return { normalizedOptions: normalized, menuItems: items }
  }, [options])

  // Set up chips display, only updating when `multiple` or options` changes
  const mergedInputProps = React.useMemo(() => {
    if (!multiple) return inputProps
    return {
      multiple,
      renderValue(selected: string[]) {
        if (!selected || !selected.map || !selected.length) {
          return placeholder ? <Chip className={classes.chip} size='small' label={placeholder} /> : <div />
        }
        return (
          <div>
            {selected.map(value => {
              const selectedOption = normalizedOptions.find(option => option.value === value)
              return (
                <Chip
                  key={value}
                  className={classes.chip}
                  size='small'
                  label={selectedOption ? selectedOption.label : '(unknown)'}
                />
              )
            })}
          </div>
        )
      },
      className: classes.select,
      displayEmpty: !!placeholder,
      ...inputProps
    }
  }, [classes.chip, classes.select, inputProps, multiple, normalizedOptions, placeholder])

  return (
    <Field
      name={name}
      allowNull={allowNull}
      render={({ input, meta }) => {
        const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || !!meta.error) && meta.touched
        const helperText = showError ? meta.error || meta.submitError : undefined
        const value = multiple && !Array.isArray(input.value) ? [] : input.value
        return (
          <TextField
            select
            {...input}
            value={value}
            inputProps={mergedInputProps}
            error={showError}
            helperText={helperText}
            margin='normal'
            {...textFieldProps}
          >
            {menuItems}
          </TextField>
        )
      }}
    />
  )
}

ChipSelect.defaultProps = {
  allowNull: true
}
