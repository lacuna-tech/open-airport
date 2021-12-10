import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Box, Theme } from '@material-ui/core'

const useStyles = makeStyles<Theme, { mainContentOverflow: boolean }>(theme =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      display: 'flex'
    },
    leftContainer: {
      flexGrow: 1,
      height: '100%',
      borderRight: `1px solid ${theme.palette.action.disabledBackground}`,
      [theme.breakpoints.down('lg')]: {
        maxWidth: 'calc(100% - 300px)'
      }
    },
    mainContainer: {
      display: 'flex',
      maxWidth: '100%',
      height: '90%',
      overflow: props => (props.mainContentOverflow ? 'scroll' : 'none')
    },
    rightContainer: {
      overflow: 'auto'
    },
    headerContainer: {
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.action.disabledBackground}`
    }
  })
)

export interface PageLayout2PanelProps {
  headerContent?: JSX.Element
  children: JSX.Element
  rightContent: JSX.Element
  mainContentOverflow?: boolean
}

export function PageLayout2Panel({
  headerContent,
  children,
  rightContent,
  mainContentOverflow = true
}: PageLayout2PanelProps) {
  const classes = useStyles({ mainContentOverflow })
  return (
    <div className={classes.root}>
      <Box className={classes.leftContainer}>
        <Box className={classes.headerContainer}>{headerContent}</Box>
        <Box className={classes.mainContainer}>{children}</Box>
      </Box>
      <Box className={classes.rightContainer}>{rightContent}</Box>
    </div>
  )
}
