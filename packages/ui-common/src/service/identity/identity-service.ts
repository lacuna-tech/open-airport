import { CommonConfig } from '@lacuna/agency-config'
import jwtDecode from 'jwt-decode'
import pkce_challenge from 'pkce-challenge'
import qs from 'query-string'
import { mdsFetch, ResponseType } from '../../util/request_utils'

export interface Authentication {
  access_token: string
  id_token: string
  expires_in: number
  scope: string
  token_type: string
}

export interface AuthorizedClient {
  api_audience: string
  api_name: string
  client_id: string
  client_secret: string
  token_expiration: number
}

export interface ProviderAuthorizedClients {
  [provider_id: string]: AuthorizedClient[]
}

// Should be impored from identity api package
export interface UserDomainModel {
  user_id: string
  email: string
  name: string
  app_metadata: { [key: string]: string | string[] }
}
export type CreateUserDomainModel = Omit<UserDomainModel, 'user_id'>
export interface IdentityApiPostUserRequest {
  user: CreateUserDomainModel
  login_uri: string
  roles: string[]
}

export type CreateUserRequest = IdentityApiPostUserRequest
export type CreateUserResponse = UserDomainModel

/**
 * Exchanges code for authentication
 */
function fetchToken(code: string, code_verifier: string): Promise<Authentication> {
  const { identity: identityServerUrl } = CommonConfig.serverUrl
  const { clientId } = window.authConfig.identity

  return mdsFetch({
    method: 'POST',
    url: `${identityServerUrl}/oauth/token`,
    data: { code, client_id: clientId, code_verifier, grant_type: 'authorization_code' },
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

/**
 * Gets Provider Authorized Clients for provider_id
 */
function fetchProviderAuthorizedClients({
  authToken,
  provider_id
}: {
  authToken?: string
  provider_id: string
}): Promise<ProviderAuthorizedClients> {
  const { identity: identityServerUrl } = CommonConfig.serverUrl

  return mdsFetch({
    method: 'GET',
    authToken,
    url: `${identityServerUrl}/authorized-clients/${provider_id}`,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

/**
 * Generates a PKCE challenge and verifier
 */
function generateChallenge(): {
  code_challenge: string
  code_verifier: string
} {
  return pkce_challenge()
}

/**
 * Validates a token by comparing expiration and not before against now
 */
function isTokenValid(access_token: string): boolean {
  const { exp, nbf } = jwtDecode<{ exp: number; nbf: number }>(access_token)
  const now = Date.now() / 1000
  return now < exp && (nbf ? now > nbf : true)
}

/**
 * Builds the authorization url used for login
 */
function buildAuthorizeUrl(code_challenge: string): string {
  const { identity: identityServerUrl } = CommonConfig.serverUrl
  const { clientId, audience, scope } = window.authConfig.identity

  const parameters = {
    // Adjust redirect_uri to change where user returns to after login & logout
    redirect_uri: window.location.href,
    code_challenge,
    client_id: clientId,
    audience,
    scope
  }

  return `${identityServerUrl}/authorize?${qs.stringify(parameters)}`
}

/**
 * Builds the logout url
 */
function buildLogoutUrl(code_challenge: string): string {
  const { identity: identityServerUrl } = CommonConfig.serverUrl
  const { clientId } = window.authConfig.identity

  const authorizeUrl = buildAuthorizeUrl(code_challenge)

  const parameters = {
    returnTo: authorizeUrl,
    client_id: clientId
  }

  return `${identityServerUrl}/logout?${qs.stringify(parameters)}`
}

/**
 * Create user
 */
function createUser({ authToken, user }: { authToken?: string; user: CreateUserRequest }): Promise<CreateUserResponse> {
  const { identity: identityServerUrl } = CommonConfig.serverUrl
  return mdsFetch({
    method: 'POST',
    authToken,
    url: `${identityServerUrl}/user`,
    data: user,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

export default {
  fetchToken,
  generateChallenge,
  isTokenValid,
  buildAuthorizeUrl,
  buildLogoutUrl,
  fetchProviderAuthorizedClients,
  createUser
}
