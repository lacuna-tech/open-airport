# UI Common

Building blocks for apps.

To use in an app within this monorepo:

- add as a dependency to your apps `package.json`. Make sure to use the current version number listed in `ui-common/package.json`.
- `pnpm install` and pnpm will hardlink your apps node_modules over to the sibling ui-common package in the monorepo.

## Structure

- `components` - React component library
- `services` - external API service clients
- `store` - common redux actions/handlers
- `util` - core utilities
  - `request_utils` - API service requests
  - `storage` - LocalStorage shim
  - `store_utils` - redux patterns
  - `storybook/store` - redux in storybook
  - `jest/fetch` - fetch mock
  - `jest/store` - redux testing

## Dependencies

- Typescript
- Redux
- Material-UI
- React

## UI Storybook

Start the storybook in watch mode

```sh
pnpm install
pnpm start
```

<b>Warning</b>: Since ui-common depends on agency-config, and it is symlinked within the monorepo, you must run

```sh
cd ../agency-config && pnpm build
```

in order to populate the `dist` dir. Any changes made in `agency-config` must be rebuilt before they will be reflected in `ui-common`.

Bundle storybook. This bundles can be hosted for internal use for exploring the available components without needs a local dev environment.

```sh
pnpm build:storybook
```

## Library

Build JS library from Typescript (into dist folder). This is a _required_ step before you can use this library within another Typescript project.

```sh
pnpm build
```

Build library in watch mode. Changes will rebuild automatically. Use this if you need to actively develop in ui-common at the same time as your consuming app. Watch mode will rebuild if any changes and your apps dev server should then see those new build assets and rerun its own build process.

```sh
pnpm build:watch
```

## Tests

Run all tests with Jest and React-Test-Renderer

```sh
pnpm test
```

Run tests and creates a coverage report

```sh
pnpm run test:coverage
```

## Resources

- [Material UI components](https://material-ui.com/components)
- [Using Typescript with Material UI](https://material-ui.com/guides/typescript/)
