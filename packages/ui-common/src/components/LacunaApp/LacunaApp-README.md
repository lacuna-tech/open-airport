# `<LacunaApp>`

## What's it good for?

- Streamlining app creation:
  - To have a standard "Lacuna Way" to set up our apps quickly.
  - To quickly create long-lived prototypes.
- Centralize permissions / roles logic at the app level:
  - Don't show ANY pages until logged in.
  - Add declarative rules for hiding pages based on permissions or claims.
  - Ensure sidebar menu and page routing match up perfectly.
- Automatically add error-catching boundaries, so we never show a blank screen to the user.
  - Note: there's nothing stopping a particular page from having _internal_ error boundary catching!
- Manage pages that should be shown _outside_ of the app frame.
  - e.g. pages for printing.
  - This is tricky to set up manually, but handled by `<LacunaApp>` automatically.
- Set your app/page up to show "toast" messages at the bottom of the screen via the `<Notifier/>` component (see FAQ).

## How does it work?

### Setup for your app:

**NOTE:** see `packages/open-airport` for an example of the below.

- Each app will create `<package>/src/pages/pages.tsx`
  - This is a list of `AppPageSpec` records which declaritively specifies all possible pages, including routing an permissions. The `component` of each item in the `pages` array is the top level page component.
- The `<package>/src/App.tsx` component is a single `<LacunaApp>` with:
  - the `pages` array above.
  - a Material-UI `theme`.
  - a `topRight` toolbar which applies to all pages in the app.
  - logo, title, etc.
- The `<package>/src/index.tsx` file:
  - Grabs the app-specific `store` and `history` objects.
  - Wrapps the `<App>` above with `<Provider>` and a `<ConnectedRouter/>`.
- Update `<package>/src/packages.json` to include new package name and incrimented ports
- Update `/scripts/linkAgency.sh`, `/lerna.json` and `/packages.json` to include folder references / workspaces to new applications. Be sure to run a `pnpm` and `pnpm agency <DefaultAgencyName>` in root folder afer these changes.

That's it.

### Under the hood

The following logic takes place in `ui-common/src/components/LacunaApp.tsx`:

1. If we're still logging in, show the top bar (no sidebar) and a loading spinner and wait for login.

2. Was there an auth failure? If so, show the top bar (no sidebar) and an authentication error page.

3. If we're logged in:
   1. Filter the list of `pages` passed in according to JWT `permissions` (scopes) and JWT `claims`. If no pages matched, show #2 above.
   2. For authorized pages, figure out page `<Route>`s that should be shown _inside_ the `<AppLayout>` as well as those (if any) to show _outside_ of `<AppLayout>` (e.g. for printing).
   3. Construct the `<PageMenu>` for the authorized pages.
   4. Wrap both sets of pages inside `<Switch>`, `<ThemeProvider>`, `<AppLayout>` etc. as necessary.

That's it!

## FAQ

- **Where's an example?** Take a look at the `open-airport` package for a full-featured example, implemented in the 3 files mentioned above.

- **Do I really have to use this?** No, you don't, but please do as it makes our app creation / upgrade process smoother.

- **My page has tricky logic for showing/hiding a page.** Use the `hasAuth()` callback in your page definition rather than using the simpler `hasPermission` and/or `hasProviderClaim` properties. Note that you should _prefer_ the latter two properties if at all possible, as it's easier for to reason about declarative properties.

- **My page has weird permission stuff: e.g. a button that I want to show only for some users.** You can easily handle that _within_ your page by using the `useAuth()` or related hooks to decide when to hide the button.

- **I need to stick custom stuff in the top-right toolbar for my app.** We're still working for solutions on this -- consider instead putting that functionality in a "page toolbar" that's below the blue "app toolbar".

- **Are there tests?** Yes, in storybook. Do a `yarn start` in `packages/ui-common` and look for the `<LacunaApp>`, `<PageBoundary>` and `<ErrorPage>` tests.

- **What are the `<PageBoundary>` and `<ErrorPage>` things anyway?** These implement top-level error handling in the app. Basically, if a page blows up (throws an uncaught exception during rendering), the `<PageBoundary>` will catch the error and show an `<ErrorPage>` in place of the regular page. We currently distinguish between `AuthenticationError`s and all other error types, showing special language for Auth errors. Note that you can also use `<ErrorPage>` yourself explicitly, and can customize its text if you like.

- **How do I use the `<Notifier>` business?** The `<Notifier>` component is set up to allow you to dispatch `actions.displayNotice()` and/or `actions.displayError()` -- thse show notifier toasts at the bottom of the screen which go away after 2 seconds. To take advantage of this, you only have to include the `notifier` store slice in your redux store. See the `notifier` bits in `packages/policy-manager/src/store/index.ts` for an example. You can completely ignore this if you don't want to show these toasts in your app.

- **Why are `<Provider>` and `<ConnectedRouter>` not included in `<LacunaApp>`?** By placing those **outside** of your main `<App>` component, you can easily test your app routing logic and global store state, e.g. in storybook or unit tests. See `ui-common/src/components/LacunaApp/LacunaApp.stories.tsx`
