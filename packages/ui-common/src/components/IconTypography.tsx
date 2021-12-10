import React from 'react'
import { createStyles, makeStyles, TypographyProps, Typography } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center'
    }
  })
)

export function IconTypography(props: TypographyProps & { icon: JSX.Element; children: string | JSX.Element }) {
  const classes = useStyles()
  const { icon, children, ...rest } = props

  return (
    <Typography className={classes.root} {...rest}>
      {icon}
      {children}
    </Typography>
  )
}
