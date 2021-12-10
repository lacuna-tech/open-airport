# Open Airport

Monorepo for Open Airport and related building blocks

## Quickstart

Top-level install

```sh
pnpm i
```

Set the agency

```sh
pnpm agency [agency-name]
```

You can now run any of the apps under packages:

```sh
cd packages/open-airport
pnpm start
```

```sh
cd packages/open-airport
pnpm agency Lawa
```

If you change branches or want to start over

```sh
pnpm clean && pnpm i
```

---

## Dependencies

Install [Pnpm](https://pnpm.js.org/installation)

```sh
npm install -g pnpm
```

or

```sh
npx pnpm add -g pnpm
```

Locally available packages are linked to node_modules instead of being downloaded from the registry.

## Agency Config

One and only one `agency` can be set at a time. Setting the agency creates a series of symlinks making configuration files and assets (images, css, etc.) for a given config available to be used for each app. Agencies are defined in the `agency-config` package.

To see what agencies are available look at the list under `packages/agency-config/src`

To see what the current agency is set to, check one of the symlinks already in place:

```sh
ls -al packages/open-airport/public
```

Change agency:

```sh
pnpm agency Lawa
```

You will get no warning if you:

- Don't have an agency defined
- Enter an agency name that isn't defined (misspelling for example)

---

## Development Process

We use [husky](https://www.npmjs.com/package/husky) and [lint-staged](npmjs.com/package/lint-staged) to automatically run [eslint](https://www.npmjs.com/package/eslint) and [prettier](https://www.npmjs.com/package/prettier) on all changed files in a pre-commit hook. If eslint finds any warnings or errors in the changed files the commit will be aborted, and you should resolve the eslint warnings that it reports before attempting to commit again.

eslint can unfortunately take a long time to complete (up to 20-30s depending upon your dev environment), so if you have a lot of smaller commits that you want to complete without linting each individual commit (e.g. on rebase or merge), you can skip the pre-commit hook by running:

```sh
git commit --no-verify
```

This should be done sparingly however and a full run of prettier and eslint should be performed before submitting a PR, otherwise it will be automatically rejected in CI.

### Linting Code

```sh
pnpm lint
```

### Runing tests:

```sh
pnpm test
```

### Go Back to a Clean Slate

**Caution:** any uncommitted files that fall under .gitignore will get deleted with this command.

```sh
pnpm clean && pnpm i
```

### Browser Debug Tools

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
- [Redux Devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa?hl=en)
