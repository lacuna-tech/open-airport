/**
 * <Notifier> component to pair with `notifier` redux domain.
 * Just add one to your app, e.g. in `src/index.tsx` inside your `<ThemeProvider>`.
 */
import React, { useRef, useEffect } from 'react'
import { useSnackbar, SnackbarProvider } from 'notistack'
import { IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import { useBoundAction } from '../../util/store_utils'
import notifier from '../../store/notifier/notifier'

// Process notifications from redux
function ProcessNotifications() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const clearNotice = useBoundAction((key: string) => notifier.actions.clearNotice(key))
  // Map to keep track of notices already displayed
  const displayed = useRef<{ [key: string]: boolean }>({})
  // Show noticies which are not already in `displayed`
  const { notices = [] } = notifier.selectors.useNotifier() || {}
  useEffect(() => {
    if (notices) {
      notices.forEach(notice => {
        if (!displayed.current[notice.key]) {
          const { key, variant, message } = notice
          const onClose = () => {
            clearNotice(key)
            delete displayed.current[key]
          }
          // close icon
          const action = (
            <IconButton
              aria-label='close'
              color='inherit'
              onClick={() => {
                closeSnackbar(key)
                onClose()
              }}
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </IconButton>
          )
          // tell `notistack` to show the notice
          enqueueSnackbar(message, { key, variant, onClose, action })
          displayed.current[notice.key] = true
        }
      })
    }
  }, [notices, enqueueSnackbar, closeSnackbar, clearNotice])
  return null
}

// Wrap
export default function Notifier() {
  return (
    <SnackbarProvider autoHideDuration={6000}>
      <ProcessNotifications />
    </SnackbarProvider>
  )
}
