import { createMuiTheme } from '@material-ui/core/styles'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { PaletteType, Theme } from '@material-ui/core'
import { ServerConfig } from './service'
import { AuthState } from './store'
import { AccessTokenScope } from './store/auth/access-token-scopes'
import { AppConfig } from './lib/config/types'

export interface PageProps {
  page?: AppPageSpec
}

export type ClickableContentProps = (props: { onClick: () => void }) => JSX.Element

export interface AppLayoutProps {
  /** App title to display */
  title: string
  /** src URL path to logo image.  Omit to suppress logo. */
  logoPath?: string
  /** JSX element to put into main content panel */
  content: JSX.Element
  /** JSX element to put into menu panel */
  menu?: JSX.Element
  /** Additional items to put into the top right panel */
  topRight?: JSX.Element
  /** Max container size, or `false` for no max. Defaults to 'lg' */
  maxContainerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  /** Add padding to container?  Default is `false` */
  maximized?: boolean
  /** Whether or not the main div should overflow or not. This is helpful for pages that have scrolling content,
   * as opposed to pages that situation a full width/height div with overflow scroll to accomodate height sensitive
   * containers.
   */
  overflow?: boolean
  paletteType?: PaletteType
  onPaletteToggled?: () => void
  onLogout?: () => void
  logoContent?: ClickableContentProps
  headerContent?: JSX.Element
  sidebarDefaultOpen?: boolean
}

/** Page specification setup. */
export interface AppPageSpec extends Pick<AppLayoutProps, 'title' | 'maxContainerSize' | 'maximized' | 'overflow'> {
  /** URL fragment(s), including any `:params`. */
  paths: string[]

  /** If `true`, this should also be the default path. */
  isDefaultPath?: boolean

  /** Top-level component used to render the page. */
  component: React.ComponentType<PageProps>

  /**
   * - If `true`, MUST have provider_id claim in JWT to view page.
   * - If `false`, MUST NOT have provider_id claim in JWT to view page.
   * - If `undefined`, provider_id claim is not checked.
   */
  hasProviderClaim?: boolean

  /**
   * If specified, authentication permission (a.k.a Auth0 `scope`) we need to have to view page.
   * For more complex logic, use `hasAuth()`
   */
  hasPermission?: AccessTokenScope

  /**
   * If specified, return `true` if this page should be shown according to full `AuthState`.
   * NOTE: Prefer use of `hasProviderClaim` and/or `hasPermission` if possible.
   */
  hasAuth?: (options: { auth: AuthState; config: ServerConfig; appConfig: AppConfig }) => boolean

  /** If `true`, we'll hide app layout for the page. */
  hideAppLayout?: boolean

  /** Show this item in the sidebar? Default is false. */
  showInSidebar?: boolean

  /** Explicit path to use in sidebar.  If not specified, we'll use last in `paths`.
   *  Assumes this is a valid path! */
  sidebarPath?: string

  /** Sidebar menu title. If not specified, uses `title`. */
  sidebarTitle?: string

  /** Sidebar menu icon. If not specified, shows generic icon. (???) */
  sidebarIcon?: JSX.Element
}

/** Specific component signatures. */
export interface CheckboxOptionShape {
  id: string
  name: string
  checked: boolean
}

export interface CheckboxGroupProps {
  onChange?: (index: number, event: boolean) => void
  options: CheckboxOptionShape[]
}

const { theme } = AirportConsoleConfig

export const createAppTheme: (paletteType: PaletteType) => Theme = paletteType =>
  createMuiTheme({ ...theme, palette: { ...theme.palette, type: paletteType } })
