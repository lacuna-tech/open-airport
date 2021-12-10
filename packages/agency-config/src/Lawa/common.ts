import { faFilePdf, faFileAlt } from '@fortawesome/pro-solid-svg-icons'
import { DEVELOPMENT, SANDBOX } from '../envConfig'

// LADOT common (cross-app) config.
// NOTE: this file may override ANYTHING at ANY level.
//
// Base object is assumed to be production settings.
// `enivronments.staging` will be overlaid in a `staging` build.
// `enivronments.development` will be overlaid in a `development` build.

export default {
  _agency: 'LAWA',

  agency: {
    address: '1 World Way, Los Angeles, CA 90045',
    logoPath: 'agency/common/images/logo_vector_white.svg', // logo for Auth0
    name: 'Los Angeles World Airports',
    phone: '(855) 463-5252',
    shortName: 'LAWA',
    locale: 'en-US',
    currency: 'USD',
    timezone: 'America/Los_Angeles'
  },

  custodian: {
    name: 'Lacuna'
  },

  apps: {
    common: {
      pages: {
        providerCredentials: {
          resourceLinks: [
            {
              label: 'Provider Onboarding Guide',
              url: 'https://github.com/openmobilityfoundation/mobility-data-specification',
              description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip',
              icon: faFilePdf
            },
            {
              label: 'MDS API Specification',
              url: 'https://github.com/openmobilityfoundation/mobility-data-specification',
              description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              icon: faFileAlt
            },
            {
              label: 'Technical Compliance Requirements',
              url: 'https://github.com/openmobilityfoundation/mobility-data-specification',
              description:
                'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              icon: faFileAlt
            }
          ]
        }
      }
    }
  },

  features: {},

  serverUrl: {
    config: `${DEVELOPMENT.SERVER_BASE_URL}/config`,
    jurisdiction: `${DEVELOPMENT.SERVER_BASE_URL}/jurisdiction`,
    identity: `${DEVELOPMENT.SERVER_BASE_URL}/identity`,
    metrics: `${DEVELOPMENT.SERVER_BASE_URL}/metrics`,
    geography: `${DEVELOPMENT.SERVER_BASE_URL}/geography`,
    curb: `${DEVELOPMENT.SERVER_BASE_URL}/curb`,
    trips: `${DEVELOPMENT.SERVER_BASE_URL}/trip`,
    events: `${DEVELOPMENT.SERVER_BASE_URL}/events`
  },

  theme: {
    palette: {
      primary: { main: '#027abb' },
      secondary: { main: '#56a0d3' }
    }
  },

  // Environment-specific overrides over the above
  environments: {
    // Dev-specific overrides
    development: {
      authentication: {
        identity: {
          clientId: DEVELOPMENT.IDENTITY.CLIENT_ID,
          audience: DEVELOPMENT.IDENTITY.AUDIENCE,
          claimNamespace: DEVELOPMENT.IDENTITY.NAMESPACE
        }
      },
      features: {},
      // Allow server to override api urls from `.env.development` or build command
      serverUrl: {
        jurisdiction: `${DEVELOPMENT.SERVER_BASE_URL}/jurisdiction`,
        identity: `${DEVELOPMENT.SERVER_BASE_URL}/identity`
      }
    },

    // Staging-specific overrides
    staging: {},

    sandbox: {
      authentication: {
        identity: {
          clientId: SANDBOX.IDENTITY.CLIENT_ID,
          audience: SANDBOX.IDENTITY.AUDIENCE,
          claimNamespace: SANDBOX.IDENTITY.NAMESPACE
        }
      },
      serverUrl: {
        config: `${SANDBOX.SERVER_BASE_URL}/config`,
        jurisdiction: `${SANDBOX.SERVER_BASE_URL}/jurisdiction`,
        identity: `${SANDBOX.SERVER_BASE_URL}/identity`,
        metrics: `${SANDBOX.SERVER_BASE_URL}/metrics`,
        geography: `${SANDBOX.SERVER_BASE_URL}/geography`,
        curb: `${SANDBOX.SERVER_BASE_URL}/curb`,
        trips: `${SANDBOX.SERVER_BASE_URL}/trip`,
        events: `${SANDBOX.SERVER_BASE_URL}/events`
      }
    }
  }
}
