// Default common (cross-app) config.
// `undefined`s here are to give the expected shape.
//
// Base object is assumed to be production settings.
// `environments.staging` will be overlaid in a `staging` build.

import { Color, Theme } from '@material-ui/core'
import { AuthConfig, Link, MapStyle, MapStyleProps } from './types'

// See: https://material-ui.com/customization/palette/#adding-new-colors
declare module '@material-ui/core/styles/createPalette' {
  export interface Palette {
    severity: {
      low: Palette['primary']
      medium: Palette['primary']
      high: Palette['primary']
      critical: Palette['primary']
    }
    map: {
      backgroundColor: {
        light: React.CSSProperties['color']
        dark: React.CSSProperties['color']
      }
    }
    custom: {
      primary: {
        main: Color
        light: React.CSSProperties['color']
        lighter: React.CSSProperties['color']
        lightest: React.CSSProperties['color']
        dark: React.CSSProperties['color']
        darker: React.CSSProperties['color']
        darkest: React.CSSProperties['color']
      }
      link: React.CSSProperties['color']
    }
  }
  export interface PaletteOptions {
    severity: {
      low: PaletteOptions['primary']
      medium: PaletteOptions['primary']
      high: PaletteOptions['primary']
      critical: PaletteOptions['primary']
    }
    map: {
      backgroundColor: {
        light: React.CSSProperties['color']
        dark: React.CSSProperties['color']
      }
    }
    custom: {
      primary: {
        main: Color
        light: React.CSSProperties['color']
        lighter: React.CSSProperties['color']
        lightest: React.CSSProperties['color']
        dark: React.CSSProperties['color']
        darker: React.CSSProperties['color']
        darkest: React.CSSProperties['color']
      }
    }
  }
}

// `environments.development` will be overlaid in a `development` build.
export default {
  // DEBUG: Sanity check in compiled output
  _app: 'UNDEFINED',
  _agency: 'UNDEFINED',
  _env: 'UNDEFINED',

  // Agency "human" constants.
  // per-agency
  agency: {
    address: 'UNDEFINED',
    logoPath: 'UNDEFINED', // path to svg logo file, relative to `@config/<agency>/public`
    name: 'UNDEFINED',
    phone: 'UNDEFINED',
    shortName: 'UNDEFINED',
    locale: 'UNDEFINED',
    currency: 'UNDEFINED',
    timezone: 'UNDEFINED' // e.g. "America/Los_Angeles"
  },

  custodian: {
    name: 'UNDEFINED'
  },

  // App-specifc configuration.
  // per-agency/per-app
  apps: {
    common: {
      pages: {
        providerCredentials: {
          resourceLinks: [] as Link[]
        }
      }
    }
  },

  // Authentication parameters.
  authentication: {
    identity: {
      clientId: 'UNDEFINED',
      audience: 'UNDEFINED',
      scope:
        'openid profile email offline_access admin:all audits:delete audits:read audits:vehicles:read audits:write compliance:read compliance:read:provider events:read events:read:provider events:write:provider policies:delete policies:publish policies:read policies:write providers:read service_areas:read status_changes:read telemetry:write:provider trips:read vehicles:read vehicles:read:provider vehicles:write:provider authorized-clients:read authorized-clients:read:provider metrics:read metrics:read:provider policies:read:published policies:read:unpublished geographies:read:published geographies:read:unpublished geographies:publish geographies:write jurisdictions:read jurisdictions:read:claim jurisdictions:write invoices:read invoices:read:provider stops:read transactions:read transactions:write providers:read',
      claimNamespace: 'UNDEFINED'
    }
  } as AuthConfig,

  // Technical compliance SLA thresholds for metrics
  // Needed by metrics service/pipeline, Audit and Console aps.
  compliance_sla_thresholds: {
    // vehicle count: current fleet size
    vehicle_counts: {
      registered: 100,
      deployed: 100
      // ... other statuses?
    },
    // event count: minimum number of events
    event_counts: {
      trip_start: 100,
      trip_end: 100,
      telemetry: 1000
      // ... other events?  `0` for no threshold ???
    },
    // seconds: latency between event occurance and submission
    event_latency: {
      start_end: 30, // `trip_start` and `trip_end` events
      enter_leave: 60, // `trip_enter` and `trip_leave` events
      telemetry: 1380 // telemetry events not associated with the above
    },
    // meters: max distance between telemetry events when on-trip (???)
    // TODO: hard to calculate with this, convert to time?
    telemetry_max_distance: 30
    // ... other thresholds???
  },

  // Deployment settings
  deploy: {
    // Amazon S3
    s3: {
      // per-agency/per-app
      bucketUrl: 'UNDEFINED',
      // per-agency (??)
      profile: 'UNDEFINED'
    }
  },

  // per-agency provider settings.
  provider: {
    // Active provider NAMEs, case INsensitive
    // Will be matched against `mds-providers`.
    activeProviders: [] as string[]
  },

  features: {
    diagnosticsFlag: false, // Allow showing more verbose and diagnostic features.
    vNextFlag: false, // Maybe deprecated. Was used as a blanket flag to distinguish a future version. (E.g., AirportConsole for Lawa vs FutureAirport)
    demoModeFlag: false, // Maybe deprecated. Was used to distinguish a demo environment where demo pages would replace certain pages in the routes definition.
    experimentsFlag: false, // Allows showing internal tooling/incubated pages in the menu for certain environemnts, mainly development.
    transactionsFlag: false, // Transactions feature flag
    policyFlag: false, // The policy feature flag
    policyComplianceFlag: false,
    policyCreationFlag: false,
    metricsFlag: false,
    tripPricingFlag: false
  },

  mapBox: {
    apiHost: 'UNDEFINED',
    token: 'UNDEFINED',
    options: {
      fitBoundsMaxZoom: 20
    },
    mapStyles: {
      road: {
        name: 'Road',
        url: { light: 'UNDEFINED', dark: 'UNDEFINED' }
      },
      satellite: {
        name: 'Satellite',
        url: { light: 'UNDEFINED', dark: 'UNDEFINED' }
      },
      road_satellite: {
        name: 'Road/Satellite',
        url: { light: 'UNDEFINED', dark: 'UNDEFINED' }
      },
      road_muted: {
        name: 'Road/Muted',
        url: { light: 'UNDEFINED', dark: 'UNDEFINED' }
      }
    } as { [key in MapStyle]: MapStyleProps }
  },

  // Production server urls
  // per-agency:  assumed to be same for all apps, individual apps may override
  // per-environment:  assumed to be overridden by `environment`
  serverUrl: {
    agency: 'UNDEFINED',
    audit: 'UNDEFINED',
    config: 'UNDEFINED',
    devices: 'UNDEFINED',
    geography: 'UNDEFINED',
    geographyAuthor: 'UNDEFINED',
    identity: 'UNDEFINED',
    jurisdiction: 'UNDEFINED',
    metrics: 'UNDEFINED',
    policy: 'UNDEFINED',
    policyAuthor: 'UNDEFINED',
    report: 'UNDEFINED',
    webSocket: 'UNDEFINED',
    invoice: 'UNDEFINED',
    ingest: 'UNDEFINED',
    curb: 'UNDEFINED',
    transaction: 'UNDEFINED',
    events: 'UNDEFINED',
    trips: 'UNDEFINED',
    graphql: 'UNDEFINED'
  },

  statusUrl: 'UNDEFINED',

  theme: {
    palette: {
      type: 'light',
      primary: { main: '#202B3D' },
      secondary: { main: '#4e4e4e' },
      severity: {
        low: {
          main: '#68ce67',
          light: '#86d785',
          dark: '#489048'
        },
        medium: {
          main: '#fce64e',
          light: '#fceb71',
          dark: '#b0a136'
        },
        high: {
          main: '#f3a23c',
          light: '#f5b463',
          dark: '#aa712a'
        },
        critical: {
          main: '#ec5545',
          light: '#ef776a',
          dark: '#a53b30'
        }
      },
      map: {
        backgroundColor: {
          light: '#e2e5e5',
          dark: '#2b2c2c'
        }
      },
      custom: {
        link: '#2057FF',
        primary: {
          main: {
            50: '#e1eff7',
            100: '#b3d7eb',
            200: '#81bddd',
            300: '#4ea2cf',
            400: '#288ec5',
            500: '#027abb',
            600: '#0272b5',
            700: '#0167ac',
            800: '#015da4',
            900: '#014a96',
            A100: '#c1dbff',
            A200: '#8ebeff',
            A400: '#5ba0ff',
            A700: '#4192ff'
          },
          light: '#58a9ee',
          lighter: '#90daff',
          lightest: '#c4ffff',
          dark: '#004e8b',
          darker: '#00275d',
          darkest: '#000033'
        }
      }
    }
  } as Theme,

  // Environment-specific overrides over the above
  environments: {
    development: {
      _env: 'development'
    },
    qa: {
      _env: 'qa'
    },
    staging: {
      _env: 'staging'
    },
    sandbox: {
      _env: 'sandbox'
    },
    production: {
      _env: 'production'
    }
  }
}
