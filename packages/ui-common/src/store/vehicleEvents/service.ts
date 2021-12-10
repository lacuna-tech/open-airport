import { CommonConfig } from '@lacuna/agency-config'
import { Nullable } from '@mds-core/mds-types'
import { AuthenticationError } from '../../service'
import { ResponseType, mdsFetch } from '../../util'

import { GetVehicleEventsFilterParams, VehicleEventsResponse } from './types'

const {
  agency: { timezone }
} = CommonConfig

export const fetchVehicleEvents: ({
  authToken,
  params,
  link
}: {
  authToken?: string
  params: GetVehicleEventsFilterParams
  link: Nullable<string>
}) => Promise<VehicleEventsResponse> = async ({ authToken, params, link }) => {
  const url = `${CommonConfig.serverUrl.events}/vehicle-events/`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not Authorized', url }))
  if (link) {
    return mdsFetch({
      method: 'GET',
      url: link,
      authToken,
      responseType: ResponseType.json,
      errorResponseType: ResponseType.json
    })
  }
  const data: VehicleEventsResponse = await mdsFetch({
    method: 'POST',
    url,
    authToken,
    data: params,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
  return data
}

export const fetchVehicleEventsCsv: ({
  authToken,
  params
}: {
  authToken?: string
  params: GetVehicleEventsFilterParams
}) => Promise<{ filename: string; blob: Blob }> = async ({ authToken, params }) => {
  const url = `${CommonConfig.serverUrl.events}/vehicle-events/`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not Authorized', url }))
  return mdsFetch({
    method: 'POST',
    url,
    authToken,
    data: { ...params, format: 'csv', timezone },
    responseType: ResponseType.blob,
    errorResponseType: ResponseType.json
  })
}
