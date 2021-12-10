module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
    // leave disabled, see: https://github.com/storybookjs/storybook/issues/13428
    // "@storybook/preset-create-react-app"
  ]
}
