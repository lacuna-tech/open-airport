import { MAPBOX } from '../envConfig'

// Add agency+app-level overrides here
export default {
  apps: {
    console: {},
    airport: {
      mapbox: {
        token: MAPBOX.token,
        mapStyleMap: {
          light: MAPBOX.style.light,
          dark: MAPBOX.style.dark
        }
      }
    }
  },
  theme: {
    palette: {
      primary: { main: '#004B8B' },
      secondary: { main: '#4e4e4e' },
      custom: {
        primary: {
          main: {
            50: '#eceff1',
            100: '#cfd8dc',
            200: '#b0bec5',
            300: '#90a4ae',
            400: '#78919c',
            500: '#004B8B',
            600: '#587583',
            700: '#4e6a78',
            800: '#44606e',
            900: '#334d5b',
            A100: '#abe1ff',
            A200: '#78ceff',
            A400: '#45bcff',
            A700: '#2bb3ff'
          },
          light: '#7f97a2',
          lighter: '#a5b6be',
          lightest: '#d7e8f1',
          dark: '#435761',
          darker: '#34464f',
          darkest: '#0d1f27'
        }
      }
    }
  },
  environments: {
    // dev-environment overrides
    development: {
      apps: {
        agency: {},
        airport: {}
      }
    },
    staging: {
      apps: {
        console: {}
      }
    }
  }
}
