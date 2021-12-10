import { CommonConfig } from '@lacuna/agency-config'
import type {
  MetricsApiQueryResponse,
  MetricsApiQueryDefaultResponseFormat,
  MetricsApiQueryJsonResponseFormat
} from '@lacuna-core/mds-metrics-api'
import type { ExtractApiResponseBody, ApiError } from '@mds-core/mds-api-server'
import { Timestamp } from '@mds-core/mds-types'
import { DateTime } from 'luxon'
import { mdsFetch, ResponseType } from '../../util/request_utils'
import { AuthenticationError } from '../../service'
import {
  MetricAggregate,
  MetricInterval,
  MetricName,
  MetricValues,
  DimensionValues,
  formatTime,
  MetricsApiQuery
} from '../../lib'

type MetricsResponse = ExtractApiResponseBody<MetricsApiQueryResponse>

const isErrorResponseFormat = <T extends MetricsResponse>(response: T | ApiError): response is ApiError => {
  return 'error' in (response as ApiError) || 'errors' in (response as ApiError)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDefaultResponseFormat = (response: any): response is MetricsApiQueryDefaultResponseFormat => {
  return 'rows' in response
}

const isJsonResponseFormat = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is MetricsApiQueryJsonResponseFormat => {
  return Array.isArray(response)
}

export const fetchMetricsCsv = async ({
  authToken,
  query
}: {
  authToken?: string
  query: MetricsApiQuery
}): Promise<{ filename: string; blob: Blob }> => {
  const { interval } = query
  const url =
    // Daily or current hour historic metrics need to go through rollup
    interval === 'P1D' ||
    (interval === 'PT1H' &&
      query.end_date &&
      DateTime.fromMillis(query.end_date).startOf('hour').valueOf() === DateTime.now().startOf('hour').valueOf())
      ? `${CommonConfig.serverUrl.metrics}/rollup`
      : `${CommonConfig.serverUrl.metrics}`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))

  return mdsFetch({
    method: 'POST',
    authToken,
    url,
    data: { ...query, format: 'csv' },
    responseType: ResponseType.blob,
    errorResponseType: ResponseType.json
  })

  // return { blob, filename: `csv-metric-download-${DateTime.fromISO(query.start_date).format('yyyy-mm')}.csv` }
}

export const fetchMetrics = async ({
  authToken,
  query
}: {
  authToken?: string
  query: MetricsApiQuery
}): Promise<MetricAggregate[]> => {
  const { interval } = query
  const url =
    // Daily or current hour historic metrics need to go through rollup
    // When fetching daily metrics
    interval === 'P1D' ||
    // Or when getting any metrics including up to the current hour.
    (interval === 'PT1H' &&
      query.end_date &&
      DateTime.fromMillis(query.end_date).startOf('hour').valueOf() === DateTime.now().startOf('hour').valueOf())
      ? `${CommonConfig.serverUrl.metrics}/rollup`
      : `${CommonConfig.serverUrl.metrics}`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))

  const response: MetricsResponse = await mdsFetch({
    method: 'POST',
    url,
    data: { ...query, format: 'json' },
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })

  if (isErrorResponseFormat(response)) {
    throw response
  } else if (isDefaultResponseFormat(response)) {
    const { rows } = response
    const { dimensions = [], measures } = query

    const aggregates: MetricAggregate[] = rows.map(row => {
      const [time_bin_start, ...values] = row
      const aggregate: MetricAggregate = {
        time_bin_start: time_bin_start as Timestamp,
        time_bin_start_formatted: formatTime({
          time_bin_start: time_bin_start as Timestamp,
          interval: interval as MetricInterval
        }),
        time_bin_duration: interval as MetricInterval,
        dimensions: dimensions.reduce<DimensionValues>(
          (map, key, index) => ({
            ...map,
            [key]: values[index]
          }),
          {}
        ),
        measures: measures.reduce<MetricValues>(
          (map, key, index) => ({
            ...map,
            [key as MetricName]:
              values[dimensions.length + index] === 'Infinity' ? 1 : (values[dimensions.length + index] as number)
          }),
          {}
        ),
        aggregates: []
      }

      return aggregate
    })

    return aggregates
  } else if (isJsonResponseFormat(response)) {
    const aggregates = response.map(({ time_bin_start, time_bin_duration, measures, ...props }) => {
      const aggregate = {
        ...props,
        measures: query.measures.reduce<Partial<Record<MetricName, number>>>((map, key) => {
          const value = measures[key] ? measures[key] : 0
          return {
            ...map,
            [key]: value === 'Infinity' ? 1 : value
          }
        }, {}),
        time_bin_start,
        time_bin_start_formatted: formatTime({
          time_bin_start,
          interval
        }),
        time_bin_duration: interval,
        aggregates: []
      } as MetricAggregate

      return aggregate
    })

    return aggregates
  }

  throw new Error('Unhandled Response Format')
}
