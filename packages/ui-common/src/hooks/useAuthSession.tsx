import { useEffect, useState } from 'react'
import { useTimeoutFn } from 'react-use'
import { useDispatch } from 'react-redux'
import { DateTime } from 'luxon'
import { useIdleTimer } from 'react-idle-timer'
import auth, { selectors } from '../store/auth/auth'

const undefinedTimeoutDuration = 9999999999999

export function useAuthSession() {
  const sessionState = selectors.useSession()
  const dispatch = useDispatch()
  const [isActive, setIsActive] = useState(true)

  const handleActive = () => {
    setIsActive(true)
  }

  const handleIdle = () => {
    setIsActive(false)
  }

  useIdleTimer({
    timeout: 1000 * 60 * 15,
    onActive: handleActive,
    onIdle: handleIdle,
    debounce: 500
  })

  useEffect(() => {
    // Log in on app startup.
    dispatch(auth.actions.initAuth())
  }, [dispatch])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(isActive ? 'User is active' : 'User is idle')
  }, [sessionState, isActive])

  const expires_ms =
    sessionState === undefined || !isActive
      ? // Until the session has been processed or while idle, use a really large number to buy time
        undefinedTimeoutDuration
      : // else use the precise expiration time
        sessionState.expiresAt - DateTime.now().toMillis()

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      expires_ms === undefinedTimeoutDuration
        ? 'Auth refresh is currently disabled'
        : `Auth refresh will occur in ${DateTime.fromMillis(expires_ms, { zone: 'utc' }).toFormat(
            "HH'h':mm'm':ss's'"
          )}.`
    )
  }, [expires_ms])

  useTimeoutFn(() => {
    dispatch(auth.actions.renewAuth())
  }, Math.max(0, expires_ms))
}
