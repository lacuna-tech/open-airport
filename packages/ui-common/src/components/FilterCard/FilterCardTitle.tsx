import React from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      padding: theme.spacing(1, 0),
      fontWeight: 600,
      color: theme.palette.getContrastText(theme.palette.background.default),
      textTransform: 'uppercase',
      // NOTE: ensure that text is vertically-centered with no offset spacing
      lineHeight: '1'
    }
  }),
  {
    name: 'FilterCardTitle'
  }
)

export const FilterCardTitle: React.FunctionComponent = ({ children }) => {
  const classes = useStyles()
  return (
    <Typography className={classes.root} variant='caption'>
      {children}
    </Typography>
  )
}
