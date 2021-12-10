import React from 'react'
import { Breadcrumbs, Link, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { useNavigation } from '../../util/navigation'
import { DynamicMaxWidth, useDynamicWidth } from '../../hooks/useDynamicWidth'

export type NavBreadcrumb = {
  title: string
  href: string
}

const MiddleBreadcrumb = ({ breadcrumb, maxWidth }: { breadcrumb: NavBreadcrumb; maxWidth?: number }) => {
  const navProps = useNavigation(breadcrumb.href)
  return (
    <Link {...navProps}>
      <Typography color='textPrimary' variant='body2' noWrap style={{ maxWidth, textOverflow: 'ellipsis' }}>
        {breadcrumb.title}
      </Typography>
    </Link>
  )
}

export const NavBreadcrumbs = ({
  currentLinkTitle,
  breadcrumbs = [],
  maxItems = 4,
  maxBreadcrumbWidth
}: {
  currentLinkTitle: string
  breadcrumbs?: NavBreadcrumb[]
  maxItems?: number
  maxBreadcrumbWidth?: DynamicMaxWidth // [upperMaxWidth, lowerMaxWidth]
}) => {
  const maxWidth = useDynamicWidth({ maxWidth: maxBreadcrumbWidth })
  const crumbs = breadcrumbs.map(breadcrumb => (
    <MiddleBreadcrumb key={`nav_breadcrumb_${breadcrumb.title}`} {...{ breadcrumb, maxWidth }} />
  ))
  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} {...{ maxItems }}>
      {crumbs}
      <Typography color='textPrimary' variant='body2' noWrap style={{ maxWidth, textOverflow: 'ellipsis' }}>
        {currentLinkTitle}
      </Typography>
    </Breadcrumbs>
  )
}
