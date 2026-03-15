module.exports = {
  // Use babel-jest directly rather than jest-expo preset to avoid
  // TurboModule and Expo winter runtime errors in unit tests
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: './babel.config.js',
        caller: { name: 'metro', bundler: 'metro', platform: 'ios' },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'expo|' +
      '@expo|' +
      'expo-router|' +
      'expo-secure-store|' +
      'expo-local-authentication|' +
      'expo-web-browser|' +
      'expo-constants|' +
      'expo-linking|' +
      '@react-native|' +
      'react-native$|' +
      'react-native/|' +
      'nativewind|' +
      '@supabase|' +
      'zustand|' +
      'aes-js|' +
      'react-native-get-random-values' +
    '))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Prevent react-native from pulling in native modules in Node env
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
};
