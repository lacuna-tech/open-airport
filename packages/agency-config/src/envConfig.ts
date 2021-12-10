type EnvServerConfig = {
  SERVER_BASE_URL: string
  IDENTITY: {
    AUDIENCE: string
    CLIENT_ID: string
    NAMESPACE: string
  }
}

// TODO:OPEN
// Delete string, replace with placeholder
export const DEVELOPMENT: EnvServerConfig = {
  SERVER_BASE_URL: 'https://lawa-demo.develop.api.lacuna-tech.io',
  IDENTITY: {
    AUDIENCE: 'https://api-demo.lawa.lacuna.city/',
    CLIENT_ID: 'nWFZPcQsppKSPJWJREFd5NnWhFnX3uFa',
    NAMESPACE: 'https://lacuna.ai/'
  }
}

// TODO:OPEN
// Delete string, replace with placeholder
export const SANDBOX: EnvServerConfig = {
  SERVER_BASE_URL: 'https://sandbox-api.lawa.ai',
  IDENTITY: {
    AUDIENCE: 'https://sandbox-api.lawa.ai/',
    CLIENT_ID: 'LGcdjY75ORwnX0HZXdqfQQkjsd12dXat',
    NAMESPACE: 'https://lacuna.ai/'
  }
}

export const MAPBOX = {
  token: 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJja3IwdmN0dHExdnhwMm5sMzY5bGl6cnl6In0.E69CKKm-Q95fzdf14-jeFg',
  style: {
    light: 'mapbox://styles/lacuna-mapbox/ckbqw02th0op51intggcac5xs',
    dark: 'mapbox://styles/lacuna-mapbox/ckbqw02th0op51intggcac5xs'
  }
}
