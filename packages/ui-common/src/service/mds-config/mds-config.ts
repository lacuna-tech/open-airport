/**
 * `mds-config` service endpoints
 */
import { Provider, UUID } from '@mds-core/mds-types'
import { CommonConfig } from '@lacuna/agency-config'
import { Optional } from 'utility-types'
import { LngLatBoundsLike } from 'mapbox-gl'
import { AuthenticationError } from '../../util/ResponseErrors'
import { mdsFetch, ResponseType } from '../../util/request_utils'

/** List of all known-to-the-client config files. */
export type ServerConfigPropertyName = 'providers' | 'organization' | 'featureFlags' | 'invoice'

/** Organization settings from from `organization.json5` config file.. */
export interface OrganizationConfig {
  organization: {
    shortName: string
    name: string
    jurisdiction: string
    timezone: string
    vehicleTypes: string[]
    mapBounds: LngLatBoundsLike
  }
}

/** List of active providers from from `providers.json5` config file.. */
export interface ProviderConfig {
  providers: Provider[]
}

export interface FeatureFlagsConfig {
  featureFlags: {
    invoice_read_provider: boolean
  }
}

interface ContactInfo {
  name: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
}

interface Logo {
  base64: string
  width: number
  height: number
}

export interface InvoiceConfig {
  invoice: {
    providers: {
      [key in UUID]: {
        slug: string
        locale: string
        live_date?: number
        billing_contact: ContactInfo
      }
    }
    customer: {
      slug: string
      logo: Logo
      timezone: string
    }
    issuer: {
      logo: Logo
      currency: string
      billing_contact: ContactInfo
    }
    invoice: {
      reference_number_format: string
      // Day of month to use as the edge boundary for calculating monthly trips.
      day_of_closing: number
    }
  }
}

/** Overall config-from-server shape. */
export interface ServerConfig
  extends Optional<OrganizationConfig, 'organization'>,
    Optional<ProviderConfig, 'providers'>,
    Optional<FeatureFlagsConfig, 'featureFlags'>,
    Optional<InvoiceConfig, 'invoice'> {}

/**
 * Load all specified config JSON files.
 */
async function fetchServerConfigs({
  authToken,
  fileNames
}: {
  authToken?: string
  fileNames: ServerConfigPropertyName[]
}): Promise<ServerConfig> {
  // e.g. /config/settings?p=providers&p=organization
  const configUrl = `${CommonConfig.serverUrl.config}/settings?p=${fileNames.join('&p=')}`
  if (!authToken) return Promise.reject(new AuthenticationError({ message: 'Not authorized', url: configUrl }))
  return mdsFetch({
    url: configUrl,
    authToken,
    responseType: ResponseType.json,
    errorResponseType: ResponseType.json
  })
}

export default { fetchServerConfigs }
