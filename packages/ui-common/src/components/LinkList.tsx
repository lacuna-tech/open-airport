import React, { PropsWithChildren } from 'react'
import { List, Divider, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { Link } from '@lacuna/agency-config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/pro-solid-svg-icons'
import { createStyles, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme =>
  createStyles({
    icon: { margin: '3px' },
    externalLinkIcon: { margin: '1px 6px', color: theme.palette.text.disabled }
  })
)

interface LinkListProps {
  links: Link[]
}

export const LinkList: React.FC<LinkListProps> = ({ links }: PropsWithChildren<LinkListProps>) => {
  const classes = useStyles()

  return (
    <List component='nav'>
      {links.map(({ label, url, description, icon }, i) => (
        <>
          {i > 0 && <Divider variant='inset' component='li' />}
          <ListItem button component='a' href={url} target={'_blank'} alignItems='flex-start' key={label}>
            <ListItemIcon>
              <FontAwesomeIcon {...{ icon, size: '3x', className: classes.icon }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  {label}
                  <FontAwesomeIcon {...{ icon: faExternalLinkAlt, size: 'sm', className: classes.externalLinkIcon }} />
                </div>
              }
              secondary={description}
            />
          </ListItem>
        </>
      ))}
    </List>
  )
}
