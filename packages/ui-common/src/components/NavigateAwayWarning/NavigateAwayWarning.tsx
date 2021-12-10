import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useHistory } from 'react-router'
import * as History from 'history'

type NavigationRequest = {
  location?: History.Location
  action: History.Action | 'unload'
}

export interface NavigateAwayWarningProps {
  disable?: boolean
}

export const NavigateAwayWarning: React.FunctionComponent<NavigateAwayWarningProps> = ({ disable = false }) => {
  const history = useHistory()
  const [navigationRequest, setNavigationRequest] = React.useState<NavigationRequest | null>(null)
  const allowNavigationRef = React.useRef(false)
  const confirmNavigation = () => {
    if (navigationRequest == null) {
      return
    }
    setNavigationRequest(null)

    allowNavigationRef.current = true
    const { location, action } = navigationRequest
    if (location != null) {
      switch (action) {
        case 'REPLACE': {
          history.replace(location.pathname)
          break
        }
        default: {
          history.push(location.pathname)
        }
      }
    }
    allowNavigationRef.current = false
  }
  const cancelNavigation = () => {
    setNavigationRequest(null)
  }

  React.useEffect(() => {
    if (disable) {
      return
    }
    const onUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // eslint-disable-next-line no-param-reassign
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onUnload)
    const unblock = history.block((location, action) => {
      if (allowNavigationRef.current === true) {
        return
      }
      setNavigationRequest({ location, action })
      return false
    })
    return () => {
      unblock()
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [history, disable])

  return (
    <Dialog open={navigationRequest != null}>
      <DialogTitle>Unsaved Changes May Be Lost</DialogTitle>

      <DialogContent>Unsaved changes may be lost if you navigate away. Do you wish to continue?</DialogContent>

      <DialogActions>
        <Button color='secondary' onClick={cancelNavigation} autoFocus>
          Cancel
        </Button>
        <Button variant='contained' color='primary' onClick={confirmNavigation}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
