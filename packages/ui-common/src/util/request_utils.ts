// ------------------------------------
// Generic API utilities
// ------------------------------------
import queryString, { StringifiableRecord } from 'query-string'
import {
  ResponseError,
  AuthenticationError,
  MissingResourceError,
  OfflineError,
  ResponseParseError
} from './ResponseErrors'

// We log server errors to the console by default.
// import `mdsFetchConfig` and set `mdsFetchConfig.logErrors = false` to skip logging.
export const mdsFetchConfig = {
  logErrors: true
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logError(...args: any[]) {
  // eslint-disable-next-line no-console
  if (mdsFetchConfig.logErrors) console.warn(...args)
}

// Response type to return on fetch success/error.
export enum ResponseType {
  text = 'text',
  json = 'json',
  blob = 'blob'
}

function getFileNameFromResponse(response: Response) {
  const contentDispositionHeader = response.headers.get('Content-Disposition')
  if (contentDispositionHeader) {
    const result = contentDispositionHeader.split(';')[1].trim().split('=')[1]
    return result.replace(/"/g, '')
  }
  return null
}

// Call async `response` routine to get data according to `responseType`
async function getResponseData(response: Response, responseType: ResponseType, url: string) {
  try {
    switch (responseType) {
      case ResponseType.json:
        return await response.json()
      case ResponseType.blob:
        return { filename: getFileNameFromResponse(response), blob: await response.blob() }
      default:
        // case ResponseType.text:
        return await response.text()
    }
  } catch (error) {
    const message = `Error parsing ${responseType} response:`
    logError(`mdsFetch('${url}'): ${message}`, error)
    throw new ResponseParseError({ message, response, exception: error, url })
  }
}

// `mdsFetch()`: Browser fetch and decode the response as JSON, rejecting intelligently on server error.
// Usage:
//    try {
//      const responseJSON = await mdsFetch({ url: "...", <etc> })
//    } catch (error) {
//      if (error instanceof OfflineError) alert("Browser is offline")
//      else if (error instanceof MissingResourceError) alert("Couldn't find the thing!!!")
//      else if (error instanceof AuthenticationError) alert("You better log in again")
//      else if (error instanceof ResponseParseError) alert("Server response is invalid JSON!")
//      else {
//        // Generic server error, instance of ResponseError
//        const { url, httpStatus, responseData, response } = error;
//        // `httpStatus` is a number: 500, etc
//        // `responseData` is decoded server response (according to `errorResponseType`)
//        // `response` is fetch `Response` object
//      }
//    }
interface FetchOptions {
  url: string // Full URL w/o query params
  query?: string | StringifiableRecord // Query params as string or object.  If string, must NOT start with `?`.
  method?: string // "GET" (default), "POST", "DELETE", etc
  authToken?: string // Bearer token for `Authentication` header.
  // eslint-disable-next-line @typescript-eslint/ban-types
  data?: string | {} | null // Data object, will be stringified if neccessary and set as post `body`
  fetchParams?: RequestInit // Normal `fetch()` parameters. See: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
  responseType?: ResponseType // Type to decode successful response before returning.  Defaults to `json`
  errorResponseType?: ResponseType // Type to decode error response before returning.  Defaults to `text`
}
export async function mdsFetch(options: FetchOptions) {
  const {
    url: urlPrefix,
    query,
    method = 'GET',
    authToken,
    data,
    fetchParams = {},
    responseType = ResponseType.json,
    errorResponseType = ResponseType.text
  } = options

  fetchParams.method = method

  // Set up headers
  if (!fetchParams.headers) {
    const headers: { [key: string]: string } = {}
    fetchParams.headers = headers
  }
  if (!(fetchParams.headers as Record<string, string>)['Content-Type'])
    (fetchParams.headers as Record<string, string>)['Content-Type'] = 'application/json'
  if (authToken) {
    // eslint-disable-next-line dot-notation
    ;(fetchParams.headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`
  }

  // Convert `data` to body if necessary
  if (data != null) {
    if (typeof data === 'string') fetchParams.body = data
    else fetchParams.body = JSON.stringify(data)
  }

  // If we got a query, append it to the url
  let url: string
  if (typeof query === 'string') url = `${urlPrefix}?${query}`
  else if (query) url = `${urlPrefix}?${queryString.stringify(query)}`
  else url = urlPrefix

  // Run the `fetch`
  let response: Response
  try {
    response = await fetch(url, fetchParams)
  } catch (error) {
    // fetch will only fail on network failure, e.g. when we're offline
    logError(`mdsFetch('${url}'): network error:`, error)
    // Throw a special error so we can detect we're offline.
    throw new OfflineError({ message: `Offline error fetching: ${url}`, exception: error, url })
  }

  // If there was a server error, reject with `status` and whatever data server sent back
  if (!response.ok) {
    // Attempt to decode the response according to `errorResponseType`.
    // This will throw a `ResponseParseError` if something goes wrong
    const responseData = await getResponseData(response, errorResponseType, url)
    // Throw various error flavors depending on what we got back.
    let ErrorConstructor = ResponseError
    let message
    const { status } = response
    switch (status) {
      case 404:
        ErrorConstructor = MissingResourceError
        message = `Resource not found (${status})`
        break
      case 401:
      case 403:
        ErrorConstructor = AuthenticationError
        message = `Authentication error (${status})`
        break
      default:
        message = `Server error (${status})`
    }
    const error = new ErrorConstructor({ message, response, responseData, url })
    logError(`mdsFetch('${url}'): ${message}`, error)
    throw error
  }

  // No error, resolve with the decoded response
  // This will throw a `ResponseParseError` if something goes wrong
  return getResponseData(response, responseType, url)
}
