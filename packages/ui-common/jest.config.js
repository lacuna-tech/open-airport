module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/*.stories.{ts,tsx}',
    '!**/__generated__',
    '!**/__mocks__',
    '!**/__fixtures__'
  ],
  coverageReporters: ['text', 'cobertura'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts']
}
