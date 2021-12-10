import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      margin: 0,
      padding: 0
    }
  })
)

export interface ContainerFullPageProps {
  children: JSX.Element
}

export function ContainerFullPage({ children }: ContainerFullPageProps) {
  const classes = useStyles()

  return (
    <Container maxWidth='xl' className={classes.root}>
      {children}
    </Container>
  )
}
