# Multi-Agency Config Readme

`agency-config` implements a _pattern_ to support elaborate app/server configuration along a number of dimensions:

- Agency
- App
- Environment

Apps run in the context of a single `agency`, `environment`, and `app`. Given this context, `agency-config` takes a hierarchy of config files and merges them together to produce a single app configuration which can be imported at runtime within the app.

Notably, within this config file hierarchy there is:

- a `base` agency configuration which serves as the default for all agencies, and can be extended on a per-agency basis. - a `common` app configuration which serves as the default for all apps, and which you can extend on a per-app and per-agency basis.
- three environments - `development`, `staging`, and `production`. The default environment is `production` which is then extended to create the other environments.

Ideal aspects of such a solution:

- _DRY:_ Each unique bit of configuration is specified only once.
- _Clear:_ Easy to understand where to place bits of config.
- _Simple:_ A relatively small number of files, easy to make changes.
- _Predictable:_ A simple and well-understood mechanism for combining configs.
- _Flexible:_ Easy for apps to place arbitrary values in their config, to facilitate app customization per agency.
- _Convenient:_ Easy for both clients and servers to pull in and work with the appropriate config.

For the remainder of this document assume:

- `@config` is the agency-config root (e.g. `lacuna-js/packages/agency-config/`) and
- `@app` is the root folder for this particular app (e.g. `lacuna-js/packages/open-airport/`).

<a name="file-system-structure"><br/></a>

## File System Structure

Configs live in the following file structure:

```
- lacuna-js/packages/agency-config/src/
    - apps/
        - app1.js             // Config loader for app1
        - app2.js             // Config loader for app2
        - ...
    - base/                   // Generic configs for ALL AGENCIES:
        - common.js           //    Generic config common to ALL APPS
        - app1.js             //    Generic config for APP1
        - app2.js             //    ...
        - ...
    - agency1/                // Custom configs for AGENCY1:
        - index.js            //    Config loader for AGENCY 1
        - common.js           //    Custom config common to ALL APPS for AGENCY1
        - app1.js             //    Custom config for APP1 for AGENCY1
        - app2.js             //    ...
        - ...
    - agency2/                // Custom configs for AGENCY2, just like AGENCY1
        - ...                 //    ...
```

1. **AGENCY** configs are divided at the folder level. The `base` folder represents generic defaults for **ALL AGENCIES**. Folders are then added for each agency as needed, overriding the `base`.
2. **APP** configs exist under the `base` folder as well as each `agency` folder allowing apps to be customized per agency. Within each folder a `common` config file represents common config for _ALL APPS_ and then additional configs are added, one per app, to provide app-specific configuration. These files are named using each apps [unique app identifier](../../APPS.md).
3. **ENVIRONMENT** configs are contained within each config file, one per environment.

These files are merged to product a single configuration for a given app, agency, and environment. See [Merging Configs](#merging-configs) below for how these files are combined.

<br/>

## Config File Structure

ALL config files MUST SHARE the following logical structure:

```
export default {
    agency: {},                // Agency name, contact info, etc FOR THE CURRENT AGENCY
    apps: {                    // App-specific config FOR THE CURRENT AGENCY goes here
        app1: {},              //   App 1 config -- app has total control in this domain
        app2: {},              //   App 2 config -- app has total control in this domain
    },
    authentication: {},        // Authentication settings FOR THE CURRENT AGENCY/APP
    deploy: {},                // Deployment settings FOR THE CURRENT AGENCY/APP
    provider: {},              // Provider settings FOR THE CURRENT AGENCY
    serverUrl: {},             // Various API URLs for FOR THE CURRENT AGENCY/APP
    environments: {            // Overrides FOR THE CURRENT ENVIRONMENT
        development: {},       //    Root-level overrides FOR "development" environment
        staging: {},           //    Root-level overrides FOR "staging" environments
    }
}
```

Notes about the per-file structure:

- "Secret" variables such as database credentials MUST NOT be checked in to these files.
- All settings are assumed to be for the `production` environment other than those under the `environments` domain.
- Each file - even the "application-specific" files - MUST assume that it is merged with other files AT THE ROOT LEVEL.
- The `development` and `staging` environment overrides are likewise assumed to be merged with the config AT THE ROOT LEVEL. See [Merging configs](#merging-configs) for how this works.
- Within each level of the file, keys MUST BE strictly alphabetized to make it easier to find variables.
- Prefer `camelCase` for variable names rather than `snake_case`.
- Files should be as sparse as possible: i.e. if a given file doesn't specify anything for a particular domain (`agency`, `deploy`, etc) it MUST OMIT that domain. An exception to this is made for:
  - `base/common.js`: This file specifies the expected "shape" of the overall config object and is largely populated with placeholder values.
  - `base/app1.js` etc: In addition to providing cross-agency defaults, this file specifies some placeholder values to specify the expect "shape" of the app-specific config.
- File format is `.ts` to allow for comments and to allow for flexibility within the file. For example, "dev" environments for some apps allow developers to override `serverURL`s with unix environment variables.
- New top-level "domains" (e.g. `agency` or `authentication`) may be added later.
- For maximum flexibility, agency-level configs, especially the agency-level application-specific config, MAY OVERRIDE **ANYTHING** in the config space, even "common" things.

<a name="merging-configs"><br/></a>

### Merging Configs

Assume you are merging the config for `app1` for `agency1` for the `development` environment.

That will merge the following files in this order:

| Logical Name    | File                        | Purpose                                                 |
| --------------- | --------------------------- | ------------------------------------------------------- |
| `base_common`   | `@config/base/common.js`    | Base config. Largely specifies "shape" of common config |
| `agency_common` | `@config/agency1/common.js` | Agency-level defaults for all apps                      |
| `base_app`      | `@config/base/app1.js`      | Cross-agency app defaults and "shape" of app config     |
| `agency_app`    | `@config/agency/app1.js`    | Per-agency application overrides                        |

The procedure for merging the files is as follows:

1. Create an empty `combined_config` object.
2. For each file above:
   1. Extract the `environment` domain from the rest of the `file_config`.
   2. Deep merge the `file_config` object on top of ROOT LEVEL of the `combined_config`.
   3. Because we are working with the `dev` environment, merge `environment.development` from the file with the ROOT LEVEL of the `combined_config`.
   4. Repeat for the next file.
3. Return the `combined_config`.

- Note that we would would skip step `2.3` above for a `production` deploy, because the "normal" variables in the file define the `production` setup.

- Merging is done with [Lodash "merge"](https://lodash.com/docs/#merge) semantics, and a [lodash "cloneDeep"](https://lodash.com/docs/#cloneDeep) of each object is used so that we do not mutate the source configs in memory. Note that:

  - Only objects are merged, scalar or array values **replace** previously-defined values.
  - A `null` value **will replace** a previously defined value (of any type).
  - An `undefined` value **will not replace** a previously defined value.

<a name="app-usage"><br/></a>

## Usage In Apps

Pre-requisite: [app setup](#app-setup)

Apps ALWAYS run in the context of a single `agency`, `environment`, and `app`.

### <a name="specifying-agency">1.</a> Set `agency` for your app

```
pnpm agency <agencyname>
```

This creates symbolic links pointing to the config files and assets for the agency specifed.

<br/>

### <a name="link-to-app-config">2.</a> Accessing config within your app

To access the current app config from within your apps source code you simply import the named export created for your app.

For example, in the `open-airport` app, to access the app config from any `.ts` file within that app you would:

```
// Import the "current" config for your app
// according to `REACT_APP_ENV` and `REACT_APP_AGENCY`
import { OpenAirportConfig } from '@lacuna/agency-config'

// Access typed config values as necessary
const appUrl = OpenAirportConfig.app.console.url      <= this knows url is a string
```

<br/>

### <a name="static-asset-setup">3.</a> Adding static assets

Static assets can be placed in your app configuration and loaded from your apps code. This includes css, svg icons, images, etc. These assets can be configured per agency and per app.

- All static assets MUST reside in the folder `@config/<agency>/public`
- Agency-wide static resources MUST be placed in `@config/<agency>/public/common/`
- App-specific resources for an agency MUST be placed in `@config/<agency>/public/<app>/`
  <br/>

### <a name="link-to-agency-images">4.</a> Linking to agency-wide images

Once images have been added to your configuration you can load them in your app. Apps created using `create-react-app` specify static assets at path `@app/public`.
You'll link to agency-specific images from the `@app/public/agency` symlink set up by the `pnpm agency` command.

For example, the `@app/public/index.html` file provided by `create-react-app` you'd set:

```
<link rel="shortcut icon" href="%PUBLIC_URL%/agency/common/images/favicon-32.png" />
```

<br/>

### <a name="link-to-agency-css">5.</a> Linking to agency-specific CSS

Once stylesheets have been added to your configuration you can load them in your app.

1. Common (cross-app) agency-specific css overrides should be placed in: `@config/<agency>/public/common/agency.css`
2. App-specific, agency-specific css overrides should be placed in: `@config/<agency>/public/<app>/agency.css`

These can be loaded into your app via the `@app/src/agency` symlink, e.g. in `@app/src/index.css`:

```
/* import common agency overrides */
@import "./agency/common/agency.css"

/* import app-specific agency overrides */
@import "./agency/open-airport/agency.css"
```

<a name="app-setup"><br/></a>

## App Setup

There are a few steps to adding `agency-config` to a new app.

### <a name="yarn-agency-setup">1.</a> Link agency

In the top-level of your app folder, add the following script to `package.json`:

`"agency": "bash ../agency-config/scripts/linkAgency.sh"`

Then in the same folder with your CLI run:

`pnpm agency <agencyname>`

Where `<agencyname>` is one of the available agencies like `LADOT`. This will:

- Create an `.env.local` file for local overrides. (NOTE: you should NOT check this file in!)
- Set up `REACT_APP_AGENCY` in that file (overriding existing setting if necessary).
- Create a symbolic link from `@config/src/<agency>/public` to `@app/public/agency` which allows you to [link to agency-wide images](#link-to-agency-images)
- Create a symbolic link from `@config/src/<agency>/public` to `@app/src/agency` which allows you to [link to agency-specific CSS](#link-to-agency-css)

<br/>

### <a name="app-config-setup">2.</a> Create app configuration

This is only necessary if you have configuration for your new app that you are ready to add to `agency-config`. You can:

- Create file `@config/src/base/<app>.ts`
  - This will dictate the "shape" of your config, including variable types.
  - Enter actual values for variables which have cross-agency defaults.
  - Enter placeholder values of the correct type for variables which are agency-specific.
  - See `@config/src/base/open-airport.ts` for an example.
- Create file `@config/src/<agency>/<app>.ts` for your initial agency.
  - Enter per-app, per-agency overrides here. You can override anything at any level as necessary.
  - See `@config/src/base/open-airport.ts` for an example.
  - Note that once you've got this working for one agency, you'll need to replicate it for other agencies which use your app.

<br/>

### <a name="config-loader-setup">3.</a> Set up config loader

- Create file `@config/src/apps/<app>.ts`
  - This is the "config loader" for your app.
  - Duplicate an existing app loader (e.g. `@config/src/apps/open-airport.ts`), changing the variable names and exact file references to your app.
- Re-export the merged config for your app in `@config/src/index.ts`
  - Follow the example for `open-airport` (`OpenAirportConfig`) in that file.
  - Note: the way the dynamic import works, there is a chance that tree-shaking will not kick in -- meaning that configs for all apps will be included in each app's build. This should have no effect other than bloating the compiled `.js` files for each app.

<br/>

### <a name="app-css-setup">4.</a> Set up app-specific assets

Finally, you can add agency/app-specific assets and [access them](#static-asset-setup) from your code. This includes css, svg icons, images, etc.

<a name="faq"><br/></a>

## FAQ / Notes

### What are `_app`, `_env` variables etc used for?

We define the following variables at the top-level of the file(s) as a "sanity check" so you can easily tell which version of the [merged config](#merging-configs) you are looking at.

| Variable  | Usage / Values                                          |
| --------- | ------------------------------------------------------- |
| `_app`    | Logical app name                                        |
| `_agency` | Agency name (may be redundant with `agency` properties) |
| `_env`    | "production", "staging" or "development"                |

The underscores are so they appear at the top of the file, and so they are sorted together in the developer console. The variables may be used in app code as desired.
