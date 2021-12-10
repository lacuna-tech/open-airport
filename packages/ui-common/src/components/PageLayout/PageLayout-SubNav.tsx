import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Typography, AppBar, Breadcrumbs, Toolbar, ListItemIcon } from '@material-ui/core'
import clsx from 'clsx'

import { AppPageSpec } from '../../types'

import { BackButton } from '../BackButton'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    main: {
      flexGrow: 1,
      height: '100%',
      overflow: 'auto',
      display: 'flex'
    },
    subAppBar: {
      backgroundColor: theme.palette.background.paper
    },
    pageIcon: {
      marginRight: theme.spacing(1),
      minWidth: theme.spacing(0)
    },
    title: {
      flexGrow: 1
    }
  })
)

export interface PageLayoutSubNavProps {
  page?: Pick<AppPageSpec, 'title' | 'sidebarIcon'>
  parentPath?: string
  contentRight?: JSX.Element
  breadCrumbs?: JSX.Element
  children: JSX.Element
  classNames?: Partial<{ subAppBar: string }>
}

export function PageLayoutSubNav({
  page,
  parentPath,
  breadCrumbs,
  contentRight,
  children,
  classNames
}: PageLayoutSubNavProps) {
  const classes = useStyles()
  const { title, sidebarIcon } = page ?? { title: 'Missing Title', sidebarIcon: undefined }

  return (
    <div className={classes.root}>
      <AppBar position='static' className={clsx(classes.subAppBar, classNames?.subAppBar)}>
        <Toolbar variant='dense'>
          {parentPath && <BackButton to={parentPath} />}
          <ListItemIcon className={classes.pageIcon}>{sidebarIcon}</ListItemIcon>
          <Breadcrumbs aria-label='breadcrumb' className={classes.title}>
            <Typography color='textPrimary'>{title}</Typography>
            {breadCrumbs}
          </Breadcrumbs>
          {contentRight}
        </Toolbar>
      </AppBar>
      <div className={classes.main}>{children}</div>
    </div>
  )
}
