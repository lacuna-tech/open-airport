import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'

import { useNavigation } from '../../util/navigation'

const useStyles = makeStyles(
  createStyles({
    icon: {
      fontSize: 30
    }
  }),
  {
    name: 'BackButton'
  }
)

export interface BackButtonProps {
  to: string
}

export const BackButton: React.FunctionComponent<BackButtonProps> = ({ to }) => {
  const navigationProps = useNavigation(to)

  const classes = useStyles()
  return (
    <IconButton {...navigationProps} edge='start'>
      <ChevronLeft className={classes.icon} />
    </IconButton>
  )
}
