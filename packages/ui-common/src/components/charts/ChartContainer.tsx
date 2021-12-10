/**
 * Chart container, renders chart and caption/description/etc.
 * Pass explicit `height` if you don't like `200`px.
 * Pass `Chart` for the functional component to actually draw.
 */
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      pageBreakInside: 'avoid',
      breakInside: 'avoid'
    },
    contents: {
      position: 'relative',
      width: '100%',
      // background: 'white',
      overflow: 'visible',
      marginBottom: 10
    },
    topCaption: {
      textAlign: 'left',
      fontWeight: 'bold'
    },
    bottomCaption: {
      textAlign: 'center'
    },
    description: {}
  })
)

export interface ChartContainerProps {
  /** Chart component as single child, self-contained. */
  children: React.ReactNode
  /** If true, we'll show a loading spinner instead of data. */
  isLoading?: boolean
  /** Height of the chart. */
  height?: number | string
  /** Class name for outer element. */
  className?: string
  /** Chart placeholder -- shown if there's no data or not loading. */
  placeholder?: string
  /** Caption drawn under chart, center-aligned. */
  caption?: string
  /** Draw caption on top or bottom? */
  captionOn?: 'top' | 'bottom'
  /** Longer description text, left-aligned. */
  description?: string
  /** Longer description text. */
  descriptionOn?: 'top' | 'bottom'
}

export default function ChartContainer({
  children,
  isLoading,
  height = 200,
  className = 'ChartContainer',
  caption,
  captionOn = 'bottom',
  description,
  descriptionOn = captionOn
}: ChartContainerProps) {
  const classes = useStyles()
  const contents = isLoading ? <CircularProgress size={40} /> : children
  return (
    <div className={`${className} ${classes.container}`}>
      {caption && captionOn === 'top' && (
        <p className={classes.topCaption}>
          {caption}
          {!!description && descriptionOn === 'top' && (
            <Tooltip title={description}>
              <InfoIcon
                color='primary'
                fontSize='small'
                style={{ position: 'relative', left: 5, top: 5, opacity: 0.8 }}
              />
            </Tooltip>
          )}
        </p>
      )}
      <div className={classes.contents} style={{ height }}>
        {contents}
      </div>
      {caption && captionOn === 'bottom' && <p className={classes.bottomCaption}>{caption}</p>}
      {description && descriptionOn === 'bottom' && <p className={classes.description}>{description}</p>}
    </div>
  )
}
