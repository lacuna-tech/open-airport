/* eslint-disable no-console */
import React from 'react'
import { storiesOf } from '@storybook/react'

import { AuthenticationError } from '../../util/ResponseErrors'
import { createStoryProvider, stubStoryActions } from '../../util/storybook/store'
import { reducerMap as serverConfigReducerMap } from '../../store/serverConfig/serverConfig'
import auth from '../../store/auth/auth'

import { AppPageSpec } from '../../types'
import AuthAvatar from '../AuthAvatar'
import LacunaApp from './LacunaApp'

// Stub `initAuth()` action. We'll pass explicit `auth` state for each story.
stubStoryActions(auth.actions, 'initAuth')

// Various authentication state stubs (just enough to work below):
const AUTH_STATES = {
  // Authenticating
  authenticating: {
    auth: {
      authenticationStatus: 'authenticating'
    }
  },
  // Normal user, already authenticated.
  authenticated: {
    auth: {
      authenticationStatus: 'authenticated',
      permissions: ['policies:read']
    }
  },
  // StoryProvider user, already authenticated.
  authenticatedProvider: {
    auth: {
      authenticationStatus: 'authenticated',
      provider_id: 'TEST_PROVIDER_ID',
      permissions: []
    }
  },
  // Authentication failed
  authenticationFailed: {
    auth: {
      authenticationStatus: 'authenticationFailed'
    }
  }
}

function App() {
  const pages: AppPageSpec[] = [
    {
      paths: [],
      isDefaultPath: true,
      component() {
        return <div>Rendered default route.</div>
      },
      title: 'Default Path',
      showInSidebar: false
    },
    {
      paths: ['/normal'],
      component() {
        return <div>Normal page: rendered successfully!</div>
      },
      title: 'Normal Page',
      showInSidebar: true
    },
    {
      paths: ['/error'],
      component: (): JSX.Element => {
        throw new TypeError('Uh oh!')
      },
      title: 'Error Page',
      showInSidebar: true
    },
    {
      paths: ['/auth-error'],
      component: (): JSX.Element => {
        throw new AuthenticationError({ message: 'No soup for you!' })
      },
      title: 'Auth Error Page',
      showInSidebar: true
    },
    {
      paths: ['/has-permission'],
      hasPermission: 'policies:read',
      component() {
        return <div>You have policies:read permission.</div>
      },
      title: 'Has Permission',
      showInSidebar: true
    },
    {
      paths: ['/no-permission'],
      hasPermission: 'policies:write',
      component() {
        return <div>No permissions: you should not see this page!!</div>
      },
      title: 'Missing Permissions',
      showInSidebar: true
    },
    {
      paths: ['/provider-only'],
      hasProviderClaim: true,
      component() {
        return <div>Page should only be shown if you DO HAVE provider claim.</div>
      },
      title: 'Provider Only',
      showInSidebar: true
    },
    {
      paths: ['/non-provider-only'],
      hasProviderClaim: false,
      component() {
        return <div>Page should only be shown if you DO NOT HAVE provider claim.</div>
      },
      title: 'Non-Provider Only',
      showInSidebar: true
    },
    {
      paths: ['/has-auth-success'],
      hasAuth({ auth: { authenticationStatus, permissions } }) {
        return authenticationStatus === 'authenticated' && permissions.includes('policies:read')
      },
      component() {
        return <div>Page with custom hasAuth() method which SUCCEEDS.</div>
      },
      title: 'Has Auth Success',
      showInSidebar: true
    },
    {
      paths: ['/has-auth-failure'],
      hasAuth({ auth: { authenticationStatus, permissions } }) {
        return authenticationStatus === 'authenticated' && permissions.includes('policies:delete')
      },
      component() {
        return <div>Page with custom hasAuth() method which FAILS.</div>
      },
      title: 'Has Auth Failure',
      showInSidebar: true
    },
    {
      paths: ['/outside-app-layout'],
      component() {
        return <div>Page should render outside of app layout.</div>
      },
      title: 'Outside App Layout',
      hideAppLayout: true
    },
    {
      paths: ['/outside-app-layout-error'],
      component: (): JSX.Element => {
        throw new TypeError('Uh oh!')
      },
      title: 'Outside App Layout Error',
      hideAppLayout: true
    }
  ]
  return <LacunaApp pages={pages} title='Test App' topRight={<AuthAvatar />} />
}

const StoryProvider = createStoryProvider(auth.reducerMap, serverConfigReducerMap)

/** Tests specific to `authenticating` state. */
storiesOf('LacunaApp/authenticating', module).add('Should show loading spinner and no sidebar', () => (
  <StoryProvider path='/' state={AUTH_STATES.authenticating}>
    <App />
  </StoryProvider>
))

/** Tests specific to `authenticationFailed` state. */
storiesOf('LacunaApp/authenticationFailed', module).add('Should show auth error and no sidebar', () => (
  <StoryProvider path='/' state={AUTH_STATES.authenticationFailed}>
    <App />
  </StoryProvider>
))

/** Tests specific to "normal" authenticated users (with NO provider claim in JWT).  */
storiesOf('LacunaApp/authenticated (non-provider)', module)
  .add('Default route (normal page)', () => (
    <StoryProvider path='/' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Normal page with explicit route', () => (
    <StoryProvider path='/normal' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page which throws TypeError', () => (
    <StoryProvider path='/error' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page which throws AuthenticationError', () => (
    <StoryProvider path='/auth-error' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page for which you have permissions', () => (
    <StoryProvider path='/has-permission' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page for which you DONT have permission. Should show default page.', () => (
    <StoryProvider path='/no-permission' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page MUST HAVE provider claim, which you DO NOT have.  Should show default page.', () => (
    <StoryProvider path='/provider-only' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page which MUST NOT have provider claim.', () => (
    <StoryProvider path='/non-provider-only' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page with custom hasAuth() which succeeds.', () => (
    <StoryProvider path='/has-auth-success' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page with custom hasAuth() which fails. Should show default page.', () => (
    <StoryProvider path='/has-auth-failure' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page which shows OUTSIDE of AppLayout.', () => (
    <StoryProvider path='/outside-app-layout' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))
  .add('Page which shows OUTSIDE of AppLayout but throws error.', () => (
    <StoryProvider path='/outside-app-layout-error' state={AUTH_STATES.authenticated}>
      <App />
    </StoryProvider>
  ))

/** Tests specific to authenticated users with provider claim in JWT  */
storiesOf('LacunaApp/authenticated as provider', module)
  .add('Page requires provider claim (which you have).', () => (
    <StoryProvider path='/provider-only' state={AUTH_STATES.authenticatedProvider}>
      <App />
    </StoryProvider>
  ))
  .add('Page must NOT have provider claim.  Should show default page.', () => (
    <StoryProvider path='/non-provider-only' state={AUTH_STATES.authenticatedProvider}>
      <App />
    </StoryProvider>
  ))
