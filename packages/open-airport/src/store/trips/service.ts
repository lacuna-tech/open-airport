import { GetTripsOptions, GetTripsTimeRangeOption, GetTripsOrderOption } from '@lacuna-core/mds-trip-backend'
import { CommonConfig } from '@lacuna/agency-config'
import { AuthenticationError, mdsFetch, RecordFrom, ResponseType } from '@lacuna/ui-common'
import { isStringArray } from '@mds-core/mds-utils'
import { Nullable } from 'lib'
import { GetTripsApiResult } from './types'

const buildTimeRangeParams = (range: GetTripsTimeRangeOption) => {
  let paramStr = ''
  if (range?.start) {
    paramStr += `&start_time=${range.start}`
  }
  if (range?.end) {
    paramStr += `&end_time=${range.end}`
  }
  return paramStr
}

export const buildTripsUrl = (url: string, params?: RecordFrom<GetTripsOptions>) => {
  let baseUrl = `${url}?`
  if (params) {
    const paramString = (Object.keys(params) as (keyof GetTripsOptions)[])
      .map(key => {
        // Time range params
        if (params[key] !== undefined && key === 'time_range') {
          const range = params[key] as GetTripsOptions['time_range']
          if (range) {
            const valStr = buildTimeRangeParams(range)
            if (valStr.length > 0) {
              return valStr
            }
          }
        }
        if (params[key] !== undefined && key === 'order') {
          const order = params[key] as GetTripsOrderOption
          return `&order_by=${order.column}&order_direction=${order.direction}`
        }
        // Array params
        if (params[key] !== undefined && isStringArray(params[key])) {
          const valArr = params[key] as string[]
          if (valArr.length > 0) {
            return `&${valArr.map(val => `${key}=${val}`).join('&')}`
          }
          return
        }
        // Str params
        if (params[key] !== undefined) {
          return `&${key}=${params[key]}`
        }
      })
      .join('')
    baseUrl += paramString.substr(1)
  }

  return baseUrl
}

export const fetchTrips: ({
  authToken,
  params,
  link
}: {
  authToken?: string
  params: GetTripsOptions
  link: Nullable<string>
}) => Promise<GetTripsApiResult> = async ({ authToken, params, link }) => {
  const baseUrl = `${CommonConfig.serverUrl.trips}/trips`
  const url = link || buildTripsUrl(baseUrl, { ...params, limit: 10 })

  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not Authorized', url }))

  const data: GetTripsApiResult = await mdsFetch({
    method: 'GET',
    url,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })

  return data
}

export const fetchTripsCsv: ({
  authToken,
  params
}: {
  authToken?: string
  params: GetTripsOptions
}) => Promise<{ blob: Blob }> = async ({ authToken, params }) => {
  const baseUrl = `${CommonConfig.serverUrl.trips}/trips/csv`
  const url = buildTripsUrl(baseUrl, params)

  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not Authorized', url }))

  return mdsFetch({
    method: 'GET',
    url,
    authToken,
    responseType: ResponseType.blob,
    errorResponseType: ResponseType.json
  })
}
