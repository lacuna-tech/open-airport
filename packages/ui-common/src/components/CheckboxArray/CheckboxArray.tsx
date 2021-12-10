/**
 * Array of enumerated strings rendered as a series of Matertial-ui checkboxes.
 * Assumes it's embedded in a `react-final-form`
 * TODO: move to ui-common
 */
import React from 'react'
import { Field } from 'react-final-form'
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { FormControlProps } from '@material-ui/core/FormControl'
import ActuallyChecked from '@material-ui/icons/CheckBox'
import ImplicitlyChecked from '@material-ui/icons/CheckBoxOutlined'
import Indeterminate from '@material-ui/icons/IndeterminateCheckBoxOutlined'

export type CheckboxArrayProps = {
  /** List of possible options */
  options: string[]
  /** Label for the checkbox group */
  label: string
  /** data name/path (passed to <Field>) */
  name: string
  /** If `true`, we'll add an `All` option which returns `null` when selected */
  showAllCheckbox?: boolean
  /** Label for `showAllCheckbox` */
  showAllLabel?: string
  /** allow null values (passed to <Field>) */
  allowNull?: boolean
  /** random props to apply directly to the <Field> */
  // fieldProps?: { [key: string]: any }
  /** everything else is passed to <FormControl> */
} & FormControlProps

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    controlsContainer: {
      position: 'relative',
      width: '100%',
      whiteSpace: 'nowrap'
    },

    allContainer: {
      display: 'inline-block',
      width: 96
    },
    optionsContainer: {
      display: 'inline-block',
      width: 'calc(100% - 96px)',
      verticalAlign: 'top',
      whiteSpace: 'normal'
    },

    checkbox: {
      paddingRight: 3
    },

    optionLabel: {
      paddingRight: 20
    }
  }))

export default function CheckboxArray(props: CheckboxArrayProps) {
  const classes = useStyles()
  const { options, name, allowNull, label, showAllCheckbox, showAllLabel, ...controlProps } = props
  return (
    <Field
      name={name}
      allowNull={allowNull}
      // {...fieldProps}
      render={({ input, meta }) => {
        const { value, onChange } = input
        const isArray = Array.isArray(value)
        const anyChecked = isArray && value.length > 0
        const allChecked = anyChecked && value.length === options.length

        function handleAllChange() {
          const newValues = anyChecked ? null : [...options]
          onChange(newValues)
        }
        function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
          const option = event.target.value
          const newValues = isArray ? [...value] : []
          const index = newValues.indexOf(option)
          if (index === -1) newValues.push(option)
          else newValues.splice(index, 1)
          onChange(newValues)
        }
        const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || !!meta.error) && meta.touched
        const helperText = showError ? meta.error || meta.submitError : undefined

        const indeterminate = anyChecked && !allChecked
        const checkAll = indeterminate || !isArray || !anyChecked || allChecked
        return (
          <FormControl error={showError} {...controlProps} fullWidth>
            <FormLabel component='legend'>{label}</FormLabel>
            <div className={classes.controlsContainer}>
              {showAllCheckbox && (
                <FormControlLabel
                  key='ALL'
                  label={showAllLabel}
                  className={classes.allContainer}
                  control={
                    <Checkbox
                      checked={checkAll}
                      checkedIcon={!isArray || !anyChecked ? <ActuallyChecked /> : <ImplicitlyChecked />}
                      indeterminate={indeterminate}
                      indeterminateIcon={<Indeterminate />}
                      className={classes.checkbox}
                      onChange={handleAllChange}
                    />
                  }
                />
              )}
              {(!showAllCheckbox || (isArray && anyChecked)) && (
                <FormGroup row className={classes.optionsContainer}>
                  {options.map((option: string) => (
                    <FormControlLabel
                      key={option}
                      label={option}
                      className={classes.optionLabel}
                      control={
                        <Checkbox
                          checked={isArray && value.includes(option)}
                          value={option}
                          className={classes.checkbox}
                          onChange={handleValueChange}
                        />
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </div>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        )
      }}
    />
  )
}
CheckboxArray.defaultProps = {
  showAllCheckbox: false,
  showAllLabel: 'All',
  allowNull: true
}
