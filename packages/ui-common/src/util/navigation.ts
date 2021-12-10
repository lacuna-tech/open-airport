import React, { MouseEventHandler } from 'react'
import { useHistory } from 'react-router'

export const useNavigation = (to: string) => {
  const history = useHistory()
  const onClick: MouseEventHandler = React.useCallback(
    event => {
      event.preventDefault()
      history.push(to)
    },
    [history, to]
  )
  return {
    href: to,
    onClick
  }
}
