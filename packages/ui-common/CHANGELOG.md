# Changelog

## 0.3.0

### Minor Changes

- 76415ca0: Sets maxDuration on EventMap to 14 days (2 weeks); adds maxDuration prop to TimeRangeSelector that when set limits the duration that can be selected in the custom dialog; adds error and helperText props on DateTimeInput and DateRangeInput for displaying errors.
- 2db0b579: Add new Wizard and WizardStepper components for managing multistep forms w/ Formik context; add new NavigateAwayWarning component for detecting router and browser URL changes and displaying a warning dialog; add new PickupDropoffPolicyCreationPage that integrates the new Wizard and NavigateAwayWarning as POC

### Patch Changes

- 67408127: Add `label` prop to TimeRangeSelector and update default value to "Last Activity Within"
- 103e6de2: show only unique vehicle_types
- d2f4a5ec: Changing deactivated filter icon for policy filters, and changing order of policy status filters to reflect order of returned policies.
- 2d847960: Virtualize the policy list page to improve performance and resolve issues with GL contexts being depleated.
- f04a211c: Add independant scrolling to policy rules on policy details page

## 0.2.0

### Minor Changes

- 8ba17294: Init changesets

### Patch Changes

- Updated dependencies [8ba17294]
  - @lacuna/agency-config@0.2.0

## 0.1.0

- Refactor storybook config to use new main.js
- Switch storybook to [ts-loader](https://storybook.js.org/docs/configurations/typescript-config/) based Typescript config
- Drop all storybook @types since [support added to main packages](https://github.com/storybookjs/storybook/issues/8160)
- Maintained support for both storybook and lib TS build steps
