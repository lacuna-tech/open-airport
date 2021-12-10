import { renderHook } from '@testing-library/react-hooks'
import { useRequest } from './useRequest'

const TheData = 'all done!'
const somePromise = () => new Promise<string>(resolve => setTimeout(() => resolve(TheData), 1))

it('shows loading state data when mounted', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useRequest(somePromise, []))

  // todo replace with waitForValueToChange | waitFor
  expect(result.current.loading).toEqual(true) // make sure it's a separate
  await waitForNextUpdate()
})

it('finishes loading successfully', async () => {
  const { result, waitFor } = renderHook(() => useRequest(somePromise, []))

  await waitFor(() => expect(result.current.loading).toEqual(false))
  await waitFor(() => expect(result.current.data).toEqual(TheData))
})

it('no reloading on remount when args do not change', async () => {
  const { result, rerender, waitForNextUpdate } = renderHook(({ promise, deps }) => useRequest(promise, deps), {
    initialProps: {
      promise: somePromise,
      deps: [false]
    }
  })
  expect(result.current.loading).toEqual(true)
  await waitForNextUpdate()
  expect(result.current.loading).toEqual(false)
  expect(result.current.data).toEqual(TheData)

  rerender({ promise: somePromise, deps: [false] })
  expect(result.current.loading).toEqual(false)
  expect(result.current.data).toEqual(TheData)
})

it('does reload on remount when args change', async () => {
  const { result, rerender, waitFor } = renderHook(({ promise, deps }) => useRequest(promise, deps), {
    initialProps: {
      promise: somePromise,
      deps: [false]
    }
  })

  // initial load
  await waitFor(() => expect(result.current.loading).toEqual(true))

  // finishes
  await waitFor(() => expect(result.current.loading).toEqual(false))
  await waitFor(() => expect(result.current.data).toEqual(TheData))

  // props change
  rerender({ promise: somePromise, deps: [true] })

  // rerenders
  expect(result.current.loading).toEqual(true)

  // eventually finishes successfully
  await waitFor(() => expect(result.current.loading).toEqual(false))
  await waitFor(() => expect(result.current.data).toEqual(TheData))
})
