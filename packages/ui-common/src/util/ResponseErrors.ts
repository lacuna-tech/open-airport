/* eslint-disable max-classes-per-file */
/** Errors for use in mdsFetch() */
interface ResponseErrorConstructor {
  message: string
  url?: string
  response?: Response
  exception?: Error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseData?: any
}
// Errors sent on failure in `mdsFetch()` call.
export class ResponseError extends Error {
  // Specific url associated with the error, if any.  e.g. API call URL.
  public url?: string

  // `fetch()` response object.  Won't be sent in `OfflineError`.
  public response?: Response | null

  // HTTP status code, if any.
  public httpStatus?: number

  // JS Error thrown, if any.
  public exception?: Error

  // Error response data, if any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public responseData?: any

  public constructor({ message, url, response, exception, responseData }: ResponseErrorConstructor) {
    super(message)
    // Restore prototype chain to make stack traces work out
    Object.setPrototypeOf(this, new.target.prototype)
    if (url) this.url = url
    if (responseData) this.responseData = responseData
    if (response) {
      this.httpStatus = response.status
      this.response = response
    }
    if (exception) this.exception = exception
  }
}

// Error we'll throw if fetch() failed because the network is offline.
export class OfflineError extends ResponseError {}

// Specific error we'll throw for a 404 server response.
export class MissingResourceError extends ResponseError {}

// Specific error we'll throw for authentication error 401/403.
export class AuthenticationError extends ResponseError {}

// Specific error we'll throw if we can't parse `response` according to specified `responseType`.
export class ResponseParseError extends ResponseError {}
