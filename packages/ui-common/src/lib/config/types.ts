import { CommonConfigType } from '@lacuna/agency-config/dist/apps/common'

// Eventually we should maintain a master type interface for feature flags,
// instead of inheriting from agency-config
export type Features = keyof CommonConfigType['features'] | 'invoice_read_provider' | 'tripPricingFlag'
export type ServerUrls = CommonConfigType['serverUrl']

type AppDetails = {
  appName: string
  agencyDisplayName: string // "logo"
}

export type AppConfig = {
  app: AppDetails
  featureFlags: Features[]
  serverUrl: ServerUrls
}
