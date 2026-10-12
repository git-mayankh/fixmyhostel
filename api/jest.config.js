module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  reporters: ['default', 'jest-junit'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**',
    'middleware/**',
    'models/**',
    'app.js'
  ],
  verbose: true,
  testTimeout: 10000
};
