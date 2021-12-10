// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadOrganizationsConfig } from './actions'

export const useOrganizationConfig = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadOrganizationsConfig())
  }, [dispatch])
}
