import { GlobalWithFetchMock } from 'jest-fetch-mock'
import { mdsFetchConfig, mdsFetch, ResponseType } from './request_utils'
import {
  ResponseError,
  OfflineError,
  MissingResourceError,
  AuthenticationError,
  ResponseParseError
} from './ResponseErrors'

// Use `jest-fetch-mock` to mock `fetch()` calls in tests
// See: https://www.npmjs.com/package/jest-fetch-mock
//
const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')

customGlobal.fetchMock = customGlobal.fetch
const { fetch } = global

// Turn off error console logging
mdsFetchConfig.logErrors = false

// Reset previous mocks so they don't bleed into other tests
beforeEach(() => {
  global.fetch.resetMocks()
})

describe('Mocking fetch works as expected', () => {
  test('with successful JSON response', async () => {
    // Tell `fetch()` to return `cannedResponse` on next `fetch()` request
    const cannedResponse = { 'it-worked': 'yahoo!!!' }
    fetch.once(JSON.stringify(cannedResponse), { status: 200 })
    const response = await fetch('url-not-important')
    expect(response.ok).toBe(true)
    const responseJSON = await response.json()
    expect(responseJSON).toEqual(cannedResponse)
  })

  test('with non-200 response', async () => {
    // Tell `fetch()` to respond with an error
    const cannedResponse = { abc: 123 }
    fetch.once(JSON.stringify(cannedResponse), { status: 500 })
    const response = await fetch('url-not-important')
    expect(response.ok).toBe(false)
    const responseJSON = await response.json()
    expect(responseJSON).toEqual(cannedResponse)
  })

  test('with Error response', async () => {
    // Tell `fetch()` to respond with an error
    const simulatedError = new Error('offline')
    fetch.mockRejectOnce(simulatedError)
    try {
      await fetch('url-not-important')
    } catch (error) {
      expect(error).toEqual(simulatedError)
    }
  })
})

describe('mdsFetch():', () => {
  describe('`query` parameter', () => {
    test('is ignored if not passed', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url' })
      const requestUrl = fetch.mock.calls[0][0]
      expect(requestUrl).toEqual('http://test-url')
    })

    test('is appended to url for string `query`', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url', query: 'foo=bar' })
      const requestUrl = fetch.mock.calls[0][0]
      expect(requestUrl).toEqual('http://test-url?foo=bar')
    })

    test('is encoded and appended to url for object `query`', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url', query: { foo: 'bar', baz: 1, bonk: false, nullish: null } })
      const requestUrl = fetch.mock.calls[0][0]
      expect(requestUrl).toEqual('http://test-url?baz=1&bonk=false&foo=bar&nullish')
    })
  })

  describe('`authToken` parameter', () => {
    test('is ignored if not passed', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url' })
      const requestParams = fetch.mock.calls[0][1]
      const { headers } = requestParams
      expect(headers).not.toHaveProperty('Authorization')
    })

    test('sets Authentication header set if passed', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url', authToken: 'test-token' })
      const requestParams = fetch.mock.calls[0][1]
      const { headers } = requestParams
      const key = 'Authorization'
      expect((headers as Record<string, unknown>)[key]).toEqual('Bearer test-token')
    })
  })

  describe('`fetchParams` parameter', () => {
    test('passes through valid `fetchParams` set in the call', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ url: 'http://test-url', fetchParams: { integrity: 'false' } })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams.integrity).toBe('false')
    })

    test('allows you to override default Content-Type header', async () => {
      fetch.once('{}', { status: 200 })
      const fetchParams = {
        headers: {
          'Content-Type': 'image/png'
        }
      }
      await mdsFetch({ url: 'http://test-url', fetchParams })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams.headers['Content-Type']).toBe('image/png')
    })
  })

  describe('`data` parameter', () => {
    test('is skipped if no data parameter', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ method: 'POST', url: 'http://test-url' })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams).not.toHaveProperty('body')
    })

    test('is skipped if data param is undefined', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ method: 'POST', url: 'http://test-url', data: undefined })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams).not.toHaveProperty('body')
    })

    test('is skipped if data param is undefined', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ method: 'POST', url: 'http://test-url', data: null })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams).not.toHaveProperty('body')
    })

    test('string `data` parameter is passed through to `body`', async () => {
      fetch.once('{}', { status: 200 })
      await mdsFetch({ method: 'POST', url: 'http://test-url', data: 'test-data' })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams.body).toEqual('test-data')
    })

    test('object data parameter is stringified to `body` ', async () => {
      fetch.once('{}', { status: 200 })
      const testData = { test: 'data' }
      await mdsFetch({ method: 'POST', url: 'http://test-url', data: testData })
      const requestParams = fetch.mock.calls[0][1]
      expect(requestParams.body).toEqual(JSON.stringify(testData))
    })
  })

  describe('`responseType` parameter', () => {
    test('parses response as JSON if `responseType` is not specified ', async () => {
      fetch.once('{ "a": 1 }', { status: 200 })
      const response = await mdsFetch({ url: 'http://test-url' })
      expect(response).toEqual({ a: 1 })
    })

    test('parses response as JSON if `responseType` is `JSON` ', async () => {
      fetch.once('{ "a": 1 }', { status: 200 })
      const response = await mdsFetch({ url: 'http://test-url', responseType: ResponseType.json })
      expect(response).toEqual({ a: 1 })
    })

    test('parses response as text if `responseType` is `text` ', async () => {
      fetch.once('{ "a": 1 }', { status: 200 })
      const response = await mdsFetch({ url: 'http://test-url', responseType: ResponseType.text })
      expect(response).toEqual('{ "a": 1 }')
    })

    // TODO: test `blob`?
  })

  describe('`errorResponseType` parameter', () => {
    test('parses error response as text if `errorResponseType` is not specified ', async () => {
      expect.hasAssertions()
      fetch.once('{ "a": 1 }', { status: 500 })
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        if (error instanceof ResponseError) {
          expect(error.responseData).toEqual('{ "a": 1 }')
        }
      }
    })

    test('parses error response as JSON if `errorResponseType` is `JSON` ', async () => {
      expect.hasAssertions()
      fetch.once('{ "a": 1 }', { status: 500 })
      try {
        await mdsFetch({ url: 'http://test-url', errorResponseType: ResponseType.json })
      } catch (error) {
        if (error instanceof ResponseError) {
          expect(error.responseData).toEqual({ a: 1 })
        }
      }
    })

    test('parses error response as text if `errorResponseType` is `text` ', async () => {
      expect.hasAssertions()
      fetch.once('{ "a": 1 }', { status: 500 })
      try {
        await mdsFetch({ url: 'http://test-url', errorResponseType: ResponseType.text })
      } catch (error) {
        if (error instanceof ResponseError) {
          expect(error.responseData).toEqual('{ "a": 1 }')
        }
      }
    })
  })

  describe('Exception handling', () => {
    test('throws an OfflineError if fetch() throws', async () => {
      expect.hasAssertions()
      const simulatedError = new Error('NO BUENO')
      fetch.mockRejectedValueOnce(simulatedError)
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        expect(error).toBeInstanceOf(OfflineError)
        expect(error.exception).toEqual(simulatedError)
      }
    })

    test('throws a MissingResourceError if fetch() returns a 404', async () => {
      expect.hasAssertions()
      fetch.once('Where is it?', { status: 404 })
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        if (error instanceof ResponseError) {
          expect(error).toBeInstanceOf(MissingResourceError)
          expect(error.httpStatus).toBe(404)
          expect(error.responseData).toEqual('Where is it?')
        }
      }
    })

    test('throws an AuthenticationError if fetch() returns a 401', async () => {
      expect.hasAssertions()
      fetch.once('unauthorized', { status: 401 })
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError)
        expect(error.httpStatus).toBe(401)
        expect(error.responseData).toEqual('unauthorized')
      }
    })

    test('throws an AuthenticationError if fetch() returns a 403', async () => {
      expect.hasAssertions()
      fetch.once('forbidden', { status: 403 })
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError)
        expect(error.httpStatus).toBe(403)
        expect(error.responseData).toEqual('forbidden')
      }
    })

    test('throws a ResponseError if fetch() returns a 500', async () => {
      expect.hasAssertions()
      fetch.once('random server error', { status: 500 })
      try {
        await mdsFetch({ url: 'http://test-url' })
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseError)
        expect(error.httpStatus).toBe(500)
        expect(error.responseData).toEqual('random server error')
      }
    })

    test('throws a ResponseParseError if successful fetch() cant parse response', async () => {
      expect.hasAssertions()
      fetch.once('{', { status: 200 })
      try {
        await mdsFetch({ url: 'http://test-url', responseType: ResponseType.json })
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseParseError)
      }
    })

    test('throws a ResponseParseError if unsuccessful fetch() cant parse response', async () => {
      expect.hasAssertions()
      fetch.once('{', { status: 500 })
      try {
        await mdsFetch({ url: 'http://test-url', errorResponseType: ResponseType.json })
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseParseError)
      }
    })
  })
}) // end describe(`mdsFetch()`)
