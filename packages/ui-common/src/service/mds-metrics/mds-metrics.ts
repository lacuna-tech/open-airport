/* eslint-disable no-console */
/**
 * `mds-metrics` service endpoints
 * TODO: move into UI-common?
 */
import flatten from 'lodash/flatten'
import queryString, { StringifiableRecord } from 'query-string'

import { CommonConfig } from '@lacuna/agency-config'
import { DateTime } from 'luxon'
import type { MetricDimension, MetricDomainModel } from '@lacuna-core/mds-metrics-service'
import { UUID, Nullable, NonEmptyArray } from '@mds-core/mds-types'
import { flexiblyParseDateTime } from '../../util/datetime'
import { AuthenticationError } from '../../util/ResponseErrors'
import { getVehicleTypes, getProviderIds } from '../../store/serverConfig/serverConfig'
import { mdsFetch, ResponseType } from '../../util/request_utils'
import { uniqueBy, firstOrDefaultWhere, lastOrDefault } from '../../util/enumerable'
import {
  MetricSet,
  MetricSlice,
  RandomMetricWeek,
  BuildSythenticMetricSliceSet,
  BinSize,
  BuildMetricSlice
} from '../../metrics'

// import V2SAMPLE from './new_sample_metrics.json'

// Switch to import from mds-metrics-api
type MetricFilter<D extends MetricDimension> = {
  name: D
  values: NonEmptyArray<Nullable<MetricDomainModel[D]>>
}

const MetricsApiQueryResponseFormats = ['json', 'csv'] as const
type MetricsApiQueryResponseFormat = typeof MetricsApiQueryResponseFormats[number]

export type MetricsApiQuerySpecification = {
  metrics: NonEmptyArray<string>
  interval: string
  start_date: string
  end_date?: string
  timezone?: string
  dimensions?: Array<MetricDimension>
  filters?: Array<MetricFilter<MetricDimension>>
  format?: MetricsApiQueryResponseFormat
}

export type MetricsApiQueryResponse = {
  id: UUID
  query: MetricsApiQuerySpecification
  columns: {
    name: string
    column_type: 'dimension' | 'metric'
    data_type: 'datetime' | 'string' | 'float' | 'integer'
  }[]
  rows: (string | number | null)[][]
}

export interface FetchMetricsParamsOld extends StringifiableRecord {
  /** Set to true to return simulated metrics. NOT SENT TO SERVER! */
  simulated?: boolean
  /** Which dataset to use, affects request URL. NOT SENT TO SERVER! */
  dataSet: 'micromobility' | 'tnc'
  /** Start timestamp.
   * @deprecated Replaced by bin_start. Remove this when metrics API switches over to using bin_start.
   */
  start: number | string
  /** End timestamp.
   * @deprecated Replaced by bin_end. Remove this when metrics API switches over to using bin_end.
   */
  end: number | string
  /** Start timestamp, rounded to appropriate bin boundry. */
  bin_start: number
  /** End timestamp, rounded to appropriate bin boundry. */
  bin_end: number
  /** bin_size paramter. */
  bin_size: BinSize
  /** Provider ids.  Pass `'ALL'` for all known providers. */
  provider_id?: string[] | 'ALL'
  /** Narrow to specific vehicle type.  You'll get all applicable if not specified. */
  vehicle_type?: 'bicyle' | 'scooter' // TODO: 'tnc' ???
  /** Geography to get metrics for.  */
  geography_id?: string
}

interface MetricSliceEnvelope {
  data: MetricSlice[]
  start: number
  start_formatted?: string
  end: number
}

/** Utility functions */

/**
 * Given the server JSON format, return:
 * - list of hours
 * - aggregated into days
 * - with `slice.start` replacing `data[x],start_time`
 *
 * ASSUMES that we have exactly 24 hourly slices for a day,
 *         and that hourlySlices starts on a day boundary in the correct timezone!!!!
 */
function normalizeMicroMobilityMetricsJSONResponse(hourlyEnvelopes: MetricSliceEnvelope[]): MetricSet {
  // Replace `start_time` with `slice.start` (in-place)
  // This works around a server bug where `start_time` is the time the metric was run
  hourlyEnvelopes.forEach(({ start, data }) => {
    data.forEach(row => {
      // eslint-disable-next-line no-param-reassign
      row.start_time = start
    })
  })
  const hours = new MetricSet(flatten(hourlyEnvelopes.map(envelope => envelope.data)))
  // Merge hourly slices into daily slices and return both
  const days = hours.aggregateTimeBin('hour', 'day')
  return MetricSet.join(hours, days)
}

/**
 * Given the server JSON format, return:
 * - list of hours
 * - aggregated into days
 * - with `slice.start` replacing `data[x],start_time`
 *
 * ASSUMES that we have exactly 24 hourly slices for a day,
 *         and that hourlySlices starts on a day boundary in the correct timezone!!!!
 */
function normalizeTNCMetricsResponse(metricSliceEnvelopes: MetricSliceEnvelope[]): MetricSet {
  const vehicle_types = getVehicleTypes() || []
  const provider_ids = getProviderIds() || []
  const [default_vehicle_type] = vehicle_types

  // For the time being, the front-end is asking for much more data than exists in order to
  // have a complete set of data. This means the head and tail needs to be trimmed of empty data.
  // This functionality should change at some point where the back-end is returning pages of data
  // and the front-end will have to told where the boundries exist.
  const firstEnvelopeWithData = firstOrDefaultWhere(metricSliceEnvelopes, envelope => envelope.data.length > 0)
  const firstDateOfData = (firstEnvelopeWithData ? DateTime.fromMillis(firstEnvelopeWithData.start) : DateTime.now())
    .startOf('day')
    .valueOf()

  const lastEnvelope = lastOrDefault(metricSliceEnvelopes)
  const lastDateOfData = (lastEnvelope ? DateTime.fromMillis(lastEnvelope.start) : DateTime.now()).valueOf()

  const trimmedMetricSliceEnvelopes: MetricSliceEnvelope[] = metricSliceEnvelopes.filter(
    envelope => envelope.start >= firstDateOfData && envelope.start <= lastDateOfData
  )

  // Scrub the data coming back from the metrics API for a couple reasons.
  // 1) Add any missing props that the API isn't sending
  // 2) And format various timestamps to something more human readable to help with debugging
  const scrubbedMetricSliceEnvelopes: MetricSliceEnvelope[] = trimmedMetricSliceEnvelopes
    .map(({ start, end, data }) => ({
      start,
      end,
      data: data.map(slice => ({
        ...slice,
        start_time: start,
        start_time_formatted: `${DateTime.fromMillis(start).toFormat('LL/dd')}, ${DateTime.fromMillis(start).toFormat(
          'ha'
        )}-${DateTime.fromMillis(start).plus({ hour: 1 }).toFormat('ha')}`,
        bin_size: slice.bin_size ? slice.bin_size : 'hour',
        vehicle_type: slice.vehicle_type ? slice.vehicle_type : default_vehicle_type
      })),
      start_formatted: `${DateTime.fromMillis(start).toFormat('LL/dd')}, ${DateTime.fromMillis(start).toFormat(
        'ha'
      )}-${DateTime.fromMillis(start).plus({ hour: 1 }).toFormat('ha')}`
    }))
    .sort((s1, s2) => (s1.start > s2.start ? 1 : -1))

  // In order to satisfy the requirement of having empty rows of data where no data exists,
  // a complete set of data is needed. A complete set of data will include a metric slice per
  // provider, per vehicle type, and per block of time (respective to the requested bin size.)
  // Fortunately the API returns envelopes for each block of time between the requested start
  // and end times. This relieves the burder of having to synthetically create blocks of time.
  // We will need to syntheticly create any missing data per provider and vehicle type within
  // each of these blocks however.
  // The product of this operations is to intersect a synthetically created and complete set of
  // default data for the envelope with the envelope's data, favoring the latter.
  const defragmentedMetricSliceEnvelopes: MetricSliceEnvelope[] = scrubbedMetricSliceEnvelopes.map(envelope => {
    const { data, start } = envelope

    // Build a complete set of synthetic data by provider and vehicle type, for hourly bin_size
    const syntheticMetricSliceSet = BuildSythenticMetricSliceSet({
      vehicle_types,
      provider_ids,
      start_time: start,
      bin_size: 'hour'
    })

    // Now merge the synthetic metric slice set with any existing data for this envelope,
    // by comparing the data with the combination of provider_id and vehicle type.
    return {
      ...envelope,
      data: uniqueBy(
        [...syntheticMetricSliceSet, ...data],
        metricSlice => `${metricSlice.provider_id}_${metricSlice.vehicle_type}`
      )
    }
  })

  // Collecting all the metrics slices from the envelopes into a large array of all slices.
  const hourlySet = new MetricSet(flatten(defragmentedMetricSliceEnvelopes.map(envelope => envelope.data)))
  const dailySet = hourlySet.aggregateTimeBin('hour', 'day')
  const monthlySet = dailySet.aggregateTimeBin('day', 'month')

  console.log({ metricSliceEnvelopes, firstDateOfData, lastDateOfData, trimmedMetricSliceEnvelopes })

  console.log({
    scrubbedMetricSliceEnvelopes,
    defragmentedMetricSliceEnvelopes
  })

  console.log({ hourlySet, dailySet, monthlySet })
  return MetricSet.join(hourlySet, dailySet, monthlySet)
}

function toMetricSet(params: MetricsApiQuerySpecification, metricResponse: MetricsApiQueryResponse) {
  // Transform into MetricSet
  const slices = metricResponse.rows.map(r => {
    const start_time = r[0] != null ? flexiblyParseDateTime(r[0]) : DateTime.now()
    const slice: MetricSlice = {
      ...BuildMetricSlice({
        start_time: start_time.valueOf(),
        bin_size: 'hour',
        provider_id: r[1] as UUID,
        vehicle_type: 'tnc',
        geography: null
      }),
      ...{
        trip_count: r[2] as number,
        total_fees: r[3] as number,
        avg_wait_time: r[4] as number,
        avg_dwell_time: r[5] as number
      }
    }
    return slice
  })

  // Aggregate into daily, monthly and join into one set
  const hourlySet = new MetricSet(slices)
  const dailySet = hourlySet.aggregateTimeBin('hour', 'day')
  const monthlySet = dailySet.aggregateTimeBin('day', 'month')
  const metricSet = MetricSet.join(hourlySet, dailySet, monthlySet)
  return metricSet
}

/** API Requests */

/**
 * Fetch metrics according to `params` in JSON format.
 * Returns a single array with data from all slices (ignoring `start` and `end`).
 */
export async function fetchMetricsOld({
  authToken,
  params
}: {
  authToken?: string
  params: FetchMetricsParamsOld
}): Promise<MetricSet> {
  const { simulated = false, dataSet, ...queryParams } = params

  // Map missing `provider` or `provider_id='ALL' to actual provider names
  // NOTE: assumes that `providers` server config is loaded!
  if (!queryParams.provider_id || queryParams.provider_id === 'ALL') queryParams.provider_id = getProviderIds()

  const pathSuffix = dataSet === 'tnc' ? 'all_tnc' : 'all'
  const query = queryString.stringify(queryParams)
  const url = `${CommonConfig.serverUrl.metrics}/${pathSuffix}?${query}`

  // Completely client-side data, doesn't hit API at all
  if (simulated) {
    const sets = queryParams.provider_id.map(provider_id => RandomMetricWeek({ provider_id }))
    return MetricSet.join(...sets)
  }
  if (!authToken) throw new AuthenticationError({ message: 'Not authorized', url })
  console.warn(`mds-metrics:  loading metrics from the server. Params:`, queryParams)

  const response = (await (mdsFetch({
    url,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  }) as unknown)) as MetricSliceEnvelope[]

  // Return normalized data according to dataset
  if (dataSet === 'tnc') return normalizeTNCMetricsResponse(response)
  return normalizeMicroMobilityMetricsJSONResponse(response)
}

export async function fetchMetrics({
  authToken,
  params
}: {
  authToken?: string
  params: MetricsApiQuerySpecification
}): Promise<MetricSet> {
  // if (simulated) {
  //   const response: MetricsApiQueryResponse = (V2SAMPLE as unknown) as MetricsApiQueryResponse
  //   console.warn(`mds-metrics:  generating metrics on the client.  Params:`, params)
  //   return response
  // }

  // const response: MetricsApiQueryResponse = (V2SAMPLE as unknown) as MetricsApiQueryResponse

  const url = `${CommonConfig.serverUrl.metrics}`

  if (!authToken) throw new AuthenticationError({ message: 'Not authorized', url })
  console.info(`mds-metrics:  loading metrics from the server. Params:`, params)

  const response = (await (mdsFetch({
    url,
    authToken,
    method: 'POST',
    data: params,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  }) as unknown)) as MetricsApiQueryResponse
  return toMetricSet(params, response)
}

// Default export is all exports as a single map.
export default {
  fetchMetricsOld,
  fetchMetrics
}
