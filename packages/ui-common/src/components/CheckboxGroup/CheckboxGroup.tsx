import React, { useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { CheckboxGroupProps, CheckboxOptionShape } from '../../types'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex'
    },
    formControl: {
      margin: 0
    }
  })
)

/**
 * Uncontrolled Checkbox groups.  Initial checked state can be passed in but once initialized the state is controlled internally and passed back out onChange
 */
function CheckboxGroup(props: CheckboxGroupProps) {
  const [options, setOptions] = useState<CheckboxOptionShape[]>([...props.options])

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOptions = [...options]
    newOptions[index].checked = event.target.checked
    setOptions(newOptions)
    if (props.onChange) {
      props.onChange(index, event.target.checked)
    }
  }

  const classes = useStyles()
  const Checkboxes = props.options.map(({ name }: CheckboxOptionShape, index) => {
    return (
      <FormControlLabel
        key={index}
        control={
          <Checkbox checked={options[index].checked || false} onChange={handleChange(index)} value={name || ''} />
        }
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

export default CheckboxGroup
