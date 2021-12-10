import { ToggleButtonGroup } from '@material-ui/lab'
import { withStyles } from '@material-ui/core'

export const StyledToggleButtonGroup = withStyles(theme => ({
  grouped: {
    margin: theme.spacing(0, 0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: theme.shape.borderRadius
    },
    '&:first-child': {
      borderRadius: theme.shape.borderRadius
    }
  }
}))(ToggleButtonGroup)
