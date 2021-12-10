import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Commute } from '@material-ui/icons'
import logo from './lawa-logo.png'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      cursor: 'pointer'
    },
    avatar: {
      color: theme.palette.primary.dark,
      backgroundColor: grey[50]
    }
  })
)

export interface LogoProps {
  onClick: () => void
}

export function Logo({ onClick }: LogoProps) {
  const classes = useStyles()

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      className={classes.root}
      justifyContent='space-between'
      width='100%'
      height={64}
    >
      <Box display='flex' alignItems='center'>
        <Box paddingRight={1} marginLeft={'8px'}>
          <Commute fontSize='large' />
        </Box>
        <Box paddingLeft={0.5} paddingBottom={0.5}>
          <img src={logo} alt='lawa-logo' />
        </Box>
      </Box>
    </Box>
  )
}
