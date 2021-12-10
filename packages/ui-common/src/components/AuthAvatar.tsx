import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/pro-solid-svg-icons'
import IconButton from '@material-ui/core/IconButton'

import { useBoundAction } from '../util/store_utils'
import auth from '../store/auth/auth'

export default function AuthAvatar() {
  const logout = useBoundAction(() => auth.actions.logout())
  return (
    <IconButton edge='end' color='inherit' aria-label='open drawer' onClick={logout}>
      <FontAwesomeIcon icon={faSignOut} />
    </IconButton>
  )
}
