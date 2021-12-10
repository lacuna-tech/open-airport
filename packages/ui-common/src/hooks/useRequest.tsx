import { useEffect, useState, useCallback } from 'react'

export const useRequest = <T,>(sendRequest: () => Promise<T>, deps: unknown[]) => {
  const [results, doRequest] = useLazyRequest(sendRequest, deps)
  useEffect(doRequest, [doRequest])
  return results
}

export type RequestResponse<T> = {
  loading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any | null
  data: T | null
}

export const useLazyRequest = <T,>(
  sendRequest: () => Promise<T>,
  deps: unknown[]
): [RequestResponse<T>, () => void] => {
  const [loading, setLoading] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any | null>(null)
  const [data, setData] = useState<T | null>(null)

  const doRequest = useCallback(async () => {
    try {
      setLoading(true)
      setData(await sendRequest())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendRequest, setLoading, setError, setData, ...deps])

  return [{ loading, error, data }, doRequest]
}
