/**
 * Use `jest-fetch-mock` to mock browser `fetch()` calls in tests.
 * See: https://www.npmjs.com/package/jest-fetch-mock
 * e.g.
 *    import fetch from '../util/jest/fetch'
 *    ...
 *    fetch.once('...reply text...')      // implicitly returns http 200 response
 *    fetch.once('...', { status: 500 })  // explicit response code
 *    fetch.mockRejectOnce(new Error() }) // cause fetch to `reject()` with specified error
 */
import { GlobalWithFetchMock } from 'jest-fetch-mock'

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')

customGlobal.fetchMock = customGlobal.fetch
export default global.fetch

// Reset previous mocks so they don't bleed into other tests
beforeEach(() => {
  global.fetch.resetMocks()
})
