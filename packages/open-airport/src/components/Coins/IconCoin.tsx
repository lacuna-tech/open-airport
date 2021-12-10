import React from 'react'
import { IconOverrides } from 'lib/trip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { Coin, CoinProps } from './Coin'

interface IconCoinProps extends Omit<CoinProps, 'icon'> {
  icon: IconProp
  color?: string
  overrides?: IconOverrides
}

export const IconCoin: React.FC<IconCoinProps> = (props: IconCoinProps) => {
  const { size, icon, color, overrides, ...rest } = props

  return (
    <Coin
      {...{
        ...rest,
        size,
        icon: (
          <FontAwesomeIcon
            {...{
              // Defaults
              ...{
                icon: faQuestion,
                color: color || 'white',
                transform: 'shrink-8',
                style: {
                  cursor: 'pointer',
                  fontSize: `${size}px`,
                  pointerEvents: 'none'
                }
              },
              // Overrides
              ...{ icon, ...overrides }
            }}
          />
        )
      }}
    />
  )
}
