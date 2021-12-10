import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faSquare } from '@fortawesome/pro-solid-svg-icons'
import clsx from 'clsx'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      '& svg': {
        margin: '0 !important'
      }
    }
  })
)

export interface CoinProps extends Pick<React.HTMLProps<HTMLSpanElement>, 'style'> {
  icon: JSX.Element
  onClick: () => void
  size: number
  fillColor: string
  borderColor: string
  shape: 'circle' | 'square'
  strokeWidth: number
}

export const Coin: React.FC<CoinProps> = ({
  icon,
  onClick,
  size,
  fillColor,
  borderColor,
  shape,
  strokeWidth,
  style
}: CoinProps) => {
  const classes = useStyles()

  return (
    <span className={clsx('fa-layers fa-fw', classes.root)} {...{ style }}>
      <FontAwesomeIcon
        {...{
          icon: shape === 'circle' ? faCircle : faSquare,
          color: fillColor,
          style: {
            cursor: 'pointer',
            fontSize: `${size}px`,
            stroke: borderColor,
            strokeWidth
          },
          onClick
        }}
      />
      {icon}
    </span>
  )
}
