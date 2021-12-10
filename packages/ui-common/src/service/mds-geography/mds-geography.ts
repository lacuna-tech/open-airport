/**
 * `mds-geography` service endpoints
 */
import { UUID, Geography } from '@mds-core/mds-types'
import { CommonConfig } from '@lacuna/agency-config'
import { AuthenticationError } from '../../util/ResponseErrors'
import { mdsFetch, ResponseType } from '../../util/request_utils'

/**
 * Load all geographies
 */
function fetchGeographies({ authToken }: { authToken?: string }): Promise<{ data: { geographies: Geography[] } }> {
  const url = `${CommonConfig.serverUrl.geography}/geographies/`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))
  return mdsFetch({
    url,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

/**
 * Create a new geography (mutable until published).
 * Success response is JSON for the new geography.
 */
function createGeography(geography: Geography, { authToken }: { authToken?: string }) {
  const url = `${CommonConfig.serverUrl.geographyAuthor}/geographies`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))
  return mdsFetch({
    url,
    authToken,
    method: 'POST',
    data: geography,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

/**
 * Update an existing mutable geography.
 * Success response is JSON for the new geography.
 */
function updateGeography(geography: Geography, { authToken }: { authToken?: string }) {
  const url = `${CommonConfig.serverUrl.geographyAuthor}/geographies/${geography.geography_id}`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))
  return mdsFetch({
    url,
    authToken,
    method: 'PUT',
    data: geography,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

/**
 * Delete an existing mutable geography.
 * TODO: add to mds-geography spec
 */
function deleteGeography(geography_id: UUID, { authToken }: { authToken?: string }) {
  const url = `${CommonConfig.serverUrl.geographyAuthor}/geographies/${geography_id}`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))
  return mdsFetch({
    url,
    authToken,
    method: 'DELETE',
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

// Default export is all exports as a single map.
export default { fetchGeographies, createGeography, updateGeography, deleteGeography }
