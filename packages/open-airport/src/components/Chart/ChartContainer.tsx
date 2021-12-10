import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'
import { useMeasure } from 'react-use'
import { Dimensions } from './types'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      boxShadow: 'none',
      backgroundColor: 'transparent'
    }
  })
)

export const ChartContainer = ({ children }: { children: (dimensions: Dimensions) => JSX.Element }) => {
  const classes = useStyles()
  const [getContainerElement, { width, height }] = useMeasure()

  return (
    <Paper className={classes.root} ref={getContainerElement}>
      {width && height && <>{children({ width, height })}</>}
    </Paper>
  )
}
