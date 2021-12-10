import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { ListItem, ListItemText, Box, Theme } from '@material-ui/core'

const useStyles = makeStyles<Theme, { labelColor?: string; subLabelColor?: string; isClickable?: boolean }>(() =>
  createStyles({
    fieldLabel: {
      color: props => props.labelColor
    },
    fieldValue: {
      width: '5rem',
      textAlign: 'center',
      alignSelf: 'center'
    },
    fieldSubLabel: {
      color: props => props.subLabelColor
    },
    listItem: {
      cursor: props => (props.isClickable ? 'pointer' : 'auto')
    }
  })
)

export function ListField<T = undefined>({
  label,
  subLabel,
  autoWidth,
  disabled,
  labelColor,
  subLabelColor,
  clickValue,
  onClick,
  children
}: {
  label: string
  subLabel?: string
  autoWidth?: boolean
  disabled?: boolean
  labelColor?: string
  subLabelColor?: string
  clickValue?: T
  onClick?: (value: T) => void
  children: JSX.Element
}) {
  const classes = useStyles({
    labelColor,
    subLabelColor,
    isClickable: !disabled && onClick !== undefined
  })

  return (
    <ListItem onClick={() => onClick && clickValue && onClick(clickValue)} className={classes.listItem}>
      <ListItemText
        {...{
          primary: (
            <Box display='flex' className={classes.listItem}>
              <Box flexGrow={1} alignSelf='center'>
                <Typography
                  className={classes.fieldLabel}
                  variant='body2'
                  color={disabled ? 'textSecondary' : 'initial'}
                >
                  {label}
                </Typography>
                {subLabel && (
                  <Typography className={classes.fieldSubLabel} variant='subtitle2'>
                    {subLabel}
                  </Typography>
                )}
              </Box>
              <Box className={classes.fieldValue} style={autoWidth ? { width: 'auto' } : {}}>
                {children}
              </Box>
            </Box>
          )
        }}
      />
    </ListItem>
  )
}
