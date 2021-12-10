import { act, renderHook } from '@testing-library/react-hooks'
import { useLazyRequest } from './useRequest'

const TheData = 'all done!'
const somePromise = () => new Promise<string>(resolve => setTimeout(() => resolve(TheData), 1))

it('does nothing on mount when lazy', async () => {
  const { result } = renderHook(({ promise, deps }) => useLazyRequest(promise, deps), {
    initialProps: {
      promise: somePromise,
      deps: [false]
    }
  })
  expect(result.current[0].loading).toEqual(false)

  // act warning would notify me if a change occurred after this point
})

it('show loading when envoked when lazy', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useLazyRequest(somePromise, []))

  act(() => {
    result.current[1]()
  })

  expect(result.current[0].loading).toEqual(true)

  await waitForNextUpdate()
})

it('finishes loading successfully when envoked when lazy', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useLazyRequest(somePromise, []))

  act(() => {
    result.current[1]()
  })

  await waitForNextUpdate()

  expect(result.current[0].data).toEqual(TheData)
  expect(result.current[0].loading).toEqual(false)
})
