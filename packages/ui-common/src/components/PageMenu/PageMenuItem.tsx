import React from 'react'
import { NavLink } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

export interface PageMenuItemProps {
  /** Menu item title */
  menuTitle: string
  /** Route URL path */
  path: string
  /** Icon component */
  icon: JSX.Element
}

/**
 * Renders a react-router <NavLink> for given top-level page route
 */
export default function PageMenuItem(props: PageMenuItemProps) {
  const { menuTitle, icon, path } = props
  return (
    <ListItem component={NavLink} to={path} button activeClassName='Mui-selected'>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={menuTitle} />
    </ListItem>
  )
}
