import React, { useCallback, useMemo } from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import { Box, Container, IconButton, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core'
import Brightness7Icon from '@material-ui/icons/Brightness7'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import MenuIcon from '@material-ui/icons/Menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/pro-solid-svg-icons'

import { AppLayoutProps } from '../../types'

const drawerWidth = 240

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        display: 'flex'
      },
      toolbar: {
        padding: theme.spacing(0, 3, 0, 0) // keep right padding when drawer closed
      },
      toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
      },
      menu: {
        marginTop: theme.spacing(7)
      },
      appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      },
      menuButton: {
        marginRight: 10
      },
      menuButtonHidden: {
        display: 'none'
      },
      logoImg: {
        height: 36,
        marginRight: 36
      },
      title: {
        flexGrow: 1
      },
      drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        }),
        overflowX: 'hidden'
      },
      drawerPaperClose: {
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(8)
        }
      },
      appBarSpacer: theme.mixins.toolbar,
      content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto'
      },
      // Normal padding for container.
      // Right and Left padding comes from `MUIContainer` according to `maxContainerSize`
      container: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
      },
      containerMaximized: {
        height: 'calc(100% - 64px)',
        padding: '0',
        margin: '0'
      },
      overflow: {
        overflow: 'auto',
        overflowY: 'hidden'
      },
      navContainer: {
        height: '100%'
      },
      menuIconButton: {
        margin: theme.spacing(0, 0.5),
        color: theme.palette.common.white
      }
    }),
  { name: 'AppLayout' }
)

/**
 * Standard app layout with optional sidebar and top right controls
 */
export function AppLayout(props: AppLayoutProps) {
  const { paletteType, onPaletteToggled, onLogout, logoContent, headerContent, sidebarDefaultOpen } = props
  const classes = useStyles()
  const [open, setOpen] = React.useState(sidebarDefaultOpen)

  const handleDrawerClick = useCallback(() => {
    setOpen(!open)
  }, [open])

  /**
   * Handling various combinations of provided content for the header is getting a little out of control. It's
   * built up to this to avoid regression in other apps, but at some point let's clean this up for support only
   * for active applications at the time.
   */

  const logo = useMemo(
    () =>
      logoContent ? (
        logoContent({ onClick: handleDrawerClick })
      ) : (
        <IconButton aria-label='Open Menu' onClick={handleDrawerClick} edge='start' className={classes.menuIconButton}>
          <MenuIcon />
        </IconButton>
      ),
    [classes.menuIconButton, handleDrawerClick, logoContent]
  )

  const header = useMemo(
    () =>
      headerContent || (
        <>
          {props.logoPath && <img alt='logo' src={props.logoPath} className={classes.logoImg} />}
          <Box flexGrow={1} />
        </>
      ),
    [classes.logoImg, headerContent, props.logoPath]
  )

  return (
    <div className={classes.root}>
      <AppBar position='fixed' className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          {logo}
          {header}
          {props.topRight}
        </Toolbar>
      </AppBar>
      {props.menu && (
        <Drawer
          variant='permanent'
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
          }}
          open={open}
        >
          <Box display='flex' flexDirection={'column'} className={classes.navContainer}>
            <Box flexGrow={1}>
              <List className={classes.menu}>{props.menu}</List>
            </Box>
            <Box>
              <ListItem button onClick={onLogout}>
                <ListItemIcon>
                  <Tooltip {...{ title: 'Logout' }}>
                    <FontAwesomeIcon icon={faSignOut} size={'lg'} style={{ marginLeft: 2 }} />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary={'Logout'} />
              </ListItem>
              <ListItem button onClick={onPaletteToggled}>
                <ListItemIcon>
                  <Tooltip {...{ title: 'Toggle light/dark theme' }}>
                    {paletteType === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary={'Theme'} />
              </ListItem>
            </Box>
          </Box>
        </Drawer>
      )}
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container
          maxWidth={props.maxContainerSize}
          className={clsx(
            props.maximized ? classes.containerMaximized : classes.container,
            props.overflow ? classes.overflow : null
          )}
        >
          {props.content}
        </Container>
      </main>
    </div>
  )
}

AppLayout.defaultProps = {
  maxContainerSize: 'lg',
  maximized: false
}
