import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import clsx from 'clsx'
import { Box, IconButton, Typography } from '@material-ui/core'
import { CloseIcon } from '@material-ui/data-grid'

export const drawerWidth = 480

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default
    },
    drawerHeader: {
      alignItems: 'center',
      padding: '17px 12px 15px',
      backgroundColor: theme.palette.background.default,
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    drawerHeaderTitle: {
      fontWeight: 'normal'
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      width: drawerWidth,
      marginTop: '60px',
      height: 'calc(100% - 60px)'
    },
    drawerOpen: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.leavingScreen
      })
    }
  })
)

export function Tray({
  title,
  open,
  onClose,
  children
}: {
  title: string
  open: boolean
  onClose: () => void
  children: JSX.Element
}) {
  const classes = useStyles()

  return (
    <Drawer
      variant='persistent'
      anchor='right'
      open={open}
      transitionDuration={{ enter: 600, exit: 500 }}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      classes={{
        paper: clsx(classes.drawerPaper, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })
      }}
      onClose={onClose}
      BackdropProps={{ invisible: true }}
    >
      <div className={classes.root}>
        <Box display='flex' className={classes.drawerHeader}>
          <Box flexGrow={1}>
            <Box display='flex'>
              <Box>
                <Typography className={classes.drawerHeaderTitle} variant='h6'>
                  {title}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box alignSelf='normal'>
            <IconButton onClick={onClose}>
              <CloseIcon fontSize='large' />
            </IconButton>
          </Box>
        </Box>
        {children}
      </div>
    </Drawer>
  )
}
