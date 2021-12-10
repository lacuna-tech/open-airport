import { CommonConfig } from '@lacuna/agency-config'
import { AuthenticationError, mdsFetch, ResponseType } from '@lacuna/ui-common'
import { OrganizationsConfigResponse } from './types'

/*
  Fetch config from the /config/organizations endpoint.
  Similar to using /config/settings?p=organization, but also includes geographies with meta data.

*/
export const fetchOrganizationsConfig: ({
  authToken
}: {
  authToken?: string
}) => Promise<OrganizationsConfigResponse> = async ({ authToken }) => {
  const url = `${CommonConfig.serverUrl.config}/organizations`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not Authoriz' }))
  const data: OrganizationsConfigResponse = await mdsFetch({
    method: 'GET',
    url,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })

  return data
}
