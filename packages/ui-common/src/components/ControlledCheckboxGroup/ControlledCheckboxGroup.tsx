import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { CheckboxOptionShape } from '../../types'

export interface ControlledCheckboxGroupProps {
  onChange?: (id: string, event: boolean) => void
  options: CheckboxOptionShape[]
}

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {
      display: 'flex'
    },
    formControl: {
      margin: 0
    }
  }))

/**
 * Checkbox group with check state controlled via props
 */
function ControlledCheckboxGroup(props: ControlledCheckboxGroupProps) {
  const handleChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(id, event.target.checked)
    }
  }

  const classes = useStyles()
  const Checkboxes = props.options.map(({ id, name, checked }: CheckboxOptionShape, index) => {
    return (
      <FormControlLabel
        key={index}
        control={<Checkbox checked={checked || false} onChange={handleChange(id)} value={name || ''} />}
        label={name}
      />
    )
  })

  return (
    <div className={classes.root}>
      <FormControl component='fieldset' className={classes.formControl}>
        <FormGroup>{Checkboxes}</FormGroup>
      </FormControl>
    </div>
  )
}

export default ControlledCheckboxGroup
