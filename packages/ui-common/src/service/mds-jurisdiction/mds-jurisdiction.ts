/**
 * `mds-jurisdictions` service endpoints
 */
import { CommonConfig } from '@lacuna/agency-config'
import { mdsFetch, ResponseType } from '../../util/request_utils'
import { AuthenticationError } from '../../util/ResponseErrors'
import { Jurisdiction } from '../../lib/jurisdiction'

export interface JurisdictionResponse {
  version: string
  jurisdictions: Jurisdiction[]
}

/** Load all jurisdictions. */
function fetchJurisdictions({ authToken }: { authToken?: string }): Promise<JurisdictionResponse> {
  const url = `${CommonConfig.serverUrl.jurisdiction}/jurisdictions/`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url }))
  return mdsFetch({
    url,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

// Default export is all exports as a single map.
export default { fetchJurisdictions }
