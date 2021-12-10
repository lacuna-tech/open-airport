import React, { useMemo } from 'react'
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { Box, LinearProgress, withStyles } from '@material-ui/core'
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles'

import { ColorLuminance } from '../util/color'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: 'relative'
    },
    bottom: {},
    top: {
      position: 'absolute',
      left: 0
    },
    circle: {
      strokeLinecap: 'round'
    },
    caption: {
      fontSize: '0.6rem'
    }
  })
)

export const Gauge = React.memo(function Gauge(
  props: CircularProgressProps & {
    value: number | undefined
    colorMode: 'monochrome' | 'colorful' | 'warn'
    type: 'circular' | 'linear'
    size: 'sm' | 'lg'
  }
) {
  const { value, colorMode, type, size } = props
  const classes = useStyles()
  const theme = useTheme()

  const palette = useMemo(() => {
    if (value === undefined)
      return { main: theme.palette.grey[500], light: theme.palette.grey[300], dark: theme.palette.grey[700] }
    if (colorMode === 'warn') {
      if (value >= 90) return theme.palette.severity.critical
      if (value >= 70) return theme.palette.severity.high
      return { main: theme.palette.action.hover, light: theme.palette.action.hover, dark: theme.palette.text.primary }
    }
    if (colorMode === 'colorful') {
      if (value >= 75) return theme.palette.severity.critical
      if (value >= 50) return theme.palette.severity.high
      if (value >= 25) return theme.palette.severity.medium
      return theme.palette.severity.low
    }
    return { main: theme.palette.action.hover, light: theme.palette.action.hover, dark: theme.palette.text.primary }
  }, [colorMode, theme.palette, value])

  const ColorfullLinearProgress = withStyles(() => {
    let backgroundColor
    let barColor = palette.main

    if (value === undefined) {
      backgroundColor = theme.palette.grey[theme.palette.type === 'light' ? 200 : 700]
      barColor = theme.palette.grey[theme.palette.type === 'light' ? 400 : 500]
    } else if (colorMode === 'colorful') {
      backgroundColor =
        theme.palette.type === 'light' ? ColorLuminance(palette.light, 0.5) : ColorLuminance(palette.dark, -0.5)
    } else if (value < 70) {
      backgroundColor = theme.palette.grey[theme.palette.type === 'light' ? 200 : 700]
      barColor = theme.palette.grey[theme.palette.type === 'light' ? 500 : 200]
    } else {
      backgroundColor =
        theme.palette.type === 'light' ? ColorLuminance(palette.light, 0.5) : ColorLuminance(palette.dark, -0.5)
    }
    const style = createStyles({
      root: {
        // height: 10,
        // borderRadius: 5
      },
      colorPrimary: {
        backgroundColor
      },
      bar: {
        backgroundColor: barColor
      }
    })
    return style
  })(LinearProgress)

  const LargeColorfullLinearProgress = withStyles(() =>
    createStyles({
      root: {
        height: 10,
        borderRadius: 5
      }
    })
  )(ColorfullLinearProgress)

  return type === 'circular' ? (
    <Box className={classes.root} display='inline-flex'>
      <CircularProgress
        variant='determinate'
        className={classes.bottom}
        style={{
          color: theme.palette.type === 'light' ? palette.light : palette.dark,
          opacity: 0.25
        }}
        thickness={5}
        {...props}
        value={100}
        size={35}
      />
      <CircularProgress
        variant={value !== undefined ? 'static' : 'indeterminate'}
        className={classes.top}
        classes={{
          circle: classes.circle
        }}
        style={{ color: palette.main }}
        {...props}
        thickness={5}
        size={35}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position='absolute'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Typography className={classes.caption} variant='caption' component='div'>
          {value !== undefined ? `${Math.round(value)}%` : '-'}
        </Typography>
      </Box>
    </Box>
  ) : (
    <Box display='flex'>
      <Box alignSelf='center' style={{ width: '2.5rem', marginRight: '0.5rem' }}>
        <Typography variant={size === 'sm' ? 'caption' : 'h6'}>
          {value !== undefined ? `${Math.round(value)}%` : '-'}
        </Typography>
      </Box>
      <Box alignSelf='center' flexGrow={1}>
        {size === 'sm' ? (
          <Box className={classes.root}>
            <ColorfullLinearProgress variant={value !== undefined ? 'determinate' : 'indeterminate'} value={value} />
          </Box>
        ) : (
          <Box className={classes.root}>
            <LargeColorfullLinearProgress
              variant={value !== undefined ? 'determinate' : 'indeterminate'}
              value={value}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
})
