import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      marginTop: theme.spacing(2.5)
    }
  })
)

export interface ContainerStandardProps {
  children: JSX.Element
}

export function ContainerStandard({ children }: ContainerStandardProps) {
  const classes = useStyles()

  return (
    <Container maxWidth='xl' className={classes.root}>
      {children}
    </Container>
  )
}
