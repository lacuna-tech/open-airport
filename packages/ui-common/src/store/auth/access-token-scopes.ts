// version of mds-types and swapping references to equivalent types
export const AccessTokenScopes = [
  'admin:all',
  'audits:delete',
  'audits:read',
  'audits:vehicles:read',
  'audits:write',
  'compliance:read',
  'compliance:read:provider',
  'events:read',
  'events:read:provider',
  'events:write:provider',
  'metrics:read',
  'metrics:read:provider',
  'policies:delete',
  'policies:publish',
  'policies:read',
  'policies:write',
  'providers:read',
  'service_areas:read',
  'status_changes:read',
  'telemetry:write:provider',
  'trips:read',
  'vehicles:read',
  'vehicles:read:provider',
  'vehicles:write:provider',
  'authorized-clients:read',
  'authorized-clients:read:provider',
  'invoices:read',
  'invoices:read:provider'
] as const

export type AccessTokenScope = typeof AccessTokenScopes[number]
