/**
 * Standard <LacunaApp /> wrapper for creating apps the easy way!
 * Pass in a set of `pages` along with other standard `AppLayoutProps` and we'll:
 * - log the user in (showing loading spinner while logging in)
 * - show "unauthorized" page if they didn't log in correctly
 *   - render side bar with logout button
 * - if logged in:
 *   - whittle down pages by JWT scopes and claims
 *   - set up sidebar menu
 *   - set up routing, including routing, including pages without <AppLayout/>
 *   - render <AppLayout /> with pages inside of it
 *   - render pages which want to be rendered OUTSIDE of <AppLayout/> if necessary (e.g. for printing)
 *   - render <Notifier/> component (note: `stpre/notifier` must be set up in store).
 */
/* eslint-disable react/prop-types */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
import React, { useCallback } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { ThemeProvider } from '@material-ui/styles'
import { Theme, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import MissingIcon from '@material-ui/icons/AcUnit'

import 'typeface-roboto'

import { PaletteType } from '@material-ui/core'
import { AccessTokenScope } from '../../store/auth/access-token-scopes'
import { useAuthSession } from '../../hooks'
import { Jurisdiction } from '../../lib/jurisdiction'
import { AuthenticationError } from '../../util/ResponseErrors'
import { LoadState, useBoundAction } from '../../util/store_utils'
import { AppPageSpec, ClickableContentProps, AppLayoutProps } from '../../types'
import { auth, AuthState, serverConfig, jurisdictionStore } from '../../store'
import { ServerConfigPropertyName, ServerConfig } from '../../service/mds-config/mds-config'

import { AppLayout } from '../AppLayout/AppLayout'
import PageBoundary from '../PageBoundary/PageBoundary' /*  */
import PageMenu from '../PageMenu/PageMenu'
import { PageMenuItemProps } from '../PageMenu/PageMenuItem'
import { CenteredLoadingSpinner } from '../LoadingSpinner'
import Notifier from '../Notifier/Notifier'
import { AppErrorCases, AppInitErrorPage } from '../ErrorPage/AppInitErrorPage'
import { AppConfig } from '../../lib'
import { useConfig } from '../../contexts/config-context'

/** Return `true` if logged-in and authorized to use `page` according to redux `authState`.
 */
export function pageIsAuthorized(page: AppPageSpec, authState: AuthState, config: ServerConfig, appConfig: AppConfig) {
  const { authenticationStatus, provider_id: authProviderId, permissions } = authState
  if (authenticationStatus !== 'authenticated') return false

  // Filter pages which care about provider claim
  if (page.hasProviderClaim === true && authProviderId === undefined) return false
  if (page.hasProviderClaim === false && authProviderId !== undefined) return false

  // Filter pages which specify that a specific permission must be specified.
  if (page.hasPermission && !permissions.includes(page.hasPermission)) return false

  // Filter pages which have complex `hasAuth()` logic.
  if (page.hasAuth && !page.hasAuth({ auth: authState, config, appConfig })) return false

  return true
}

const getMissingPermissions = (permissions: AccessTokenScope[], requiredPermissions: AccessTokenScope[]) => {
  const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p))
  return new AuthenticationError({ message: missingPermissions.join(',') })
}
export interface LacunaAppProps extends Partial<AppLayoutProps> {
  /** Specification for app pages / sidebar menu / etc */
  pages: AppPageSpec[]
  /** Names of configuration files to load BEFORE app startup completes. */
  configFiles?: ServerConfigPropertyName[]
  /** Load jurisdictions automatically? Default is `false`!! */
  loadJurisdictions?: boolean
  defaultJurisdictions?: Jurisdiction[]
  /** Material-UI theme object. */
  theme?: Theme
  // Redefined based types to avoid being partials
  paletteType?: PaletteType
  onPaletteToggled?: () => void
  requiredPermissions?: AccessTokenScope[]
  logoContent?: ClickableContentProps
  headerContent?: JSX.Element
}

/** Base component for package-specific <App> component. */
export default function LacunaApp({
  pages,
  configFiles = [],
  loadJurisdictions = false,
  defaultJurisdictions = undefined,
  theme = createMuiTheme({}),
  title = 'YOU MUST PASS `title`!',
  logoPath,
  topRight,
  maxContainerSize,
  paletteType,
  onPaletteToggled,
  requiredPermissions,
  logoContent,
  headerContent,
  sidebarDefaultOpen
}: LacunaAppProps) {
  const dispatch = useDispatch()
  const authState = auth.selectors.useAuthState()
  const { authenticationStatus } = authState
  const serverConfigLoadState = serverConfig.selectors.useServerConfigFilesLoadState(configFiles)

  // TODO consolidate AppConfig w/ "server-config" and providers to
  // remove hard depdencies on redux here and inject consumer app config at initialization
  const appConfig = useConfig()
  const config = serverConfig.selectors.useServerConfig()

  const providers = serverConfig.selectors.useProviders()
  const { loaded: jurisdictionLoadState, jurisdictions } = jurisdictionStore.selectors.useJurisdictionsState()

  const handleLogout = useBoundAction(() => auth.actions.logout())

  useAuthSession()

  // Load specified serverConfig files BEFORE initializing pages.
  // NOTE: this should only happen ONCE!
  React.useEffect(() => {
    if (authenticationStatus === 'authenticated' && serverConfigLoadState === LoadState.unloaded) {
      dispatch(serverConfig.actions.loadServerConfig(configFiles))
    }
  }, [dispatch, authenticationStatus, serverConfigLoadState, configFiles])

  React.useEffect(() => {
    if (loadJurisdictions && authenticationStatus === 'authenticated' && jurisdictionLoadState === LoadState.unloaded) {
      dispatch(jurisdictionStore.actions.loadJurisdictions(defaultJurisdictions))
    }
  }, [dispatch, loadJurisdictions, defaultJurisdictions, authenticationStatus, jurisdictionLoadState])
  /** Wrap a non-page component (e.g. an ErrorPage) in <AppLayout> for visual continuity. */
  const WrapNonPageComponent = useCallback(
    ({ component, menu }: { component: JSX.Element; menu?: JSX.Element }) => (
      <AppLayout
        logoContent={logoContent}
        headerContent={headerContent}
        title={title}
        logoPath={logoPath}
        content={<PageBoundary>{component}</PageBoundary>}
        topRight={topRight}
        maxContainerSize={maxContainerSize}
        paletteType={paletteType}
        onPaletteToggled={onPaletteToggled}
        sidebarDefaultOpen={sidebarDefaultOpen}
        menu={menu}
        onLogout={handleLogout}
      />
    ),
    [
      logoContent,
      headerContent,
      title,
      logoPath,
      topRight,
      maxContainerSize,
      paletteType,
      onPaletteToggled,
      sidebarDefaultOpen,
      handleLogout
    ]
  )

  /** Component to render for an authorized `page`. */
  const PageComponent = useCallback(
    ({ page, appPageMenu }: { page: AppPageSpec; appPageMenu?: JSX.Element }) => {
      const { hideAppLayout, component: Component } = page
      if (hideAppLayout) return <Component {...{ page }} />
      return (
        <AppLayout
          {...{
            ...page,
            menu: appPageMenu,
            content: (
              <PageBoundary>
                <Component {...{ page }} />
              </PageBoundary>
            ),
            logoContent,
            headerContent,
            topRight,
            logoPath,
            maxContainerSize,
            paletteType,
            onPaletteToggled,
            onLogout: handleLogout,
            sidebarDefaultOpen
          }}
        />
      )
    },
    [
      handleLogout,
      logoContent,
      headerContent,
      logoPath,
      onPaletteToggled,
      paletteType,
      topRight,
      maxContainerSize,
      sidebarDefaultOpen
    ]
  )

  /** Get our main <App> component, recalculating only when login / server config loadState changes. */
  const authIsSuccessful = authenticationStatus !== 'authenticationFailed'
  const authIsLoading = authenticationStatus === 'authenticating'
  const serverConfigIsLoading =
    serverConfigLoadState === LoadState.unloaded || serverConfigLoadState === LoadState.loading
  const jurisdictionsIsLoading =
    (loadJurisdictions && jurisdictionLoadState === LoadState.unloaded) || jurisdictionLoadState === LoadState.loading

  // If auth is not successful, skip loading spinner and show error page
  const showLoadingSpinner = authIsSuccessful && (authIsLoading || serverConfigIsLoading || jurisdictionsIsLoading)
  const AppComponent = React.useMemo(() => {
    console.info('re-calculting <AppComponent>')
    // Authenticating or loading config / jurisdictions
    if (showLoadingSpinner) {
      const component = <CenteredLoadingSpinner />
      return function App() {
        return <WrapNonPageComponent component={component} />
      }
    }

    // Check for basic app level error cases.
    // Authentication must be successful, and base line data
    // (server config, jurisdictions, providers) must be available

    const { permissions } = authState

    const authorizedPages = pages.filter(page => pageIsAuthorized(page, authState, config, appConfig))

    const errorCases: AppErrorCases = {
      auth_failed_error: {
        condition: authenticationStatus === 'authenticationFailed',
        error: new AuthenticationError({ message: 'Not authorized.' })
      },
      config_load_error: {
        condition: serverConfigLoadState === LoadState.error,
        error: new Error('Error loading server configuration')
      },
      provider_load_error: {
        condition: serverConfigLoadState === LoadState.loaded && (!providers || providers.length === 0),
        error: new Error('Error loading providers')
      },
      jurisdiction_load_error: {
        condition: loadJurisdictions && jurisdictionLoadState === LoadState.error,
        error: new Error('Error loading jurisdictions')
      },
      jurisdiction_not_found_error: {
        condition: loadJurisdictions && jurisdictionLoadState === LoadState.loaded && jurisdictions.length === 0,
        error: new Error('Error: jurisdictions loaded, none defined')
      },
      missing_permissions_error: {
        condition: (requiredPermissions && !requiredPermissions.every(p => permissions.includes(p))) || false,
        error: getMissingPermissions(permissions, requiredPermissions || [])
      },
      no_authorized_pages_error: {
        condition: authorizedPages.length === 0,
        error: new AuthenticationError({ message: 'No authorized pages.' })
      }
    }

    const appHasErrors = Object.values(errorCases).some(({ condition }) => condition === true)

    // If we got an error, show a big error message
    if (appHasErrors) {
      return function App() {
        return <WrapNonPageComponent component={<AppInitErrorPage errors={errorCases} />} menu={<></>} />
      }
    }

    // Authorized and everything loaded without errors -- let's draw the real app!

    // Get sidebar menu items according to `authorizedPages`
    const pageMenuItems = authorizedPages
      .filter(page => page.showInSidebar)
      .map(page => {
        const item: PageMenuItemProps = {
          path: page.sidebarPath || page.paths[page.paths.length - 1],
          icon: page.sidebarIcon || <MissingIcon />,
          menuTitle: page.sidebarTitle || page.title || ''
        }
        return item
      }) as PageMenuItemProps[]

    // Set up a <PageMenu> if we got some pageMenuItems.
    const appPageMenu = pageMenuItems != null ? <PageMenu pages={pageMenuItems} /> : undefined

    // Figure out <Route>s based on authorizedPages
    const routes: JSX.Element[] = []
    let defaultRoute: JSX.Element | null = null
    authorizedPages.forEach(page => {
      if (page.isDefaultPath && !defaultRoute) {
        defaultRoute = <Route key='default' render={() => <PageComponent page={page} appPageMenu={appPageMenu} />} />
      }
      if (!page.paths || page.paths.length === 0) return
      page.paths.forEach(path =>
        routes.push(
          <Route key={path} path={path} render={() => <PageComponent page={page} appPageMenu={appPageMenu} />} />
        )
      )
    })
    if (defaultRoute) routes.push(defaultRoute)
    // Throw routes into a regular react-router <Switch>
    return function App() {
      return <Switch>{routes}</Switch>
    }
  }, [
    appConfig,
    authenticationStatus,
    serverConfigLoadState,
    loadJurisdictions,
    jurisdictionLoadState,
    providers,
    jurisdictions.length,
    authState,
    requiredPermissions,
    pages,
    WrapNonPageComponent,
    config,
    PageComponent,
    showLoadingSpinner
  ])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageBoundary>
        <AppComponent />
      </PageBoundary>
      <Notifier />
    </ThemeProvider>
  )
}
