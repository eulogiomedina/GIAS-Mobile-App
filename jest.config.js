const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/__tests__/setup.js'], // mock global de Expo
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|@react-native' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|react-clone-referenced-element' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|expo-modules-core' +
      '|expo-constants' +
      '|expo-router' +
      '|expo-asset' +
      '|expo-file-system' +
      '|expo-secure-store' +
      '|expo-random' +
      '|expo-linking' +
      '|expo-haptics' +
      ')'
  ],

  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.(jpg|jpeg|png|gif|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  clearMocks: true,
  collectCoverage: false,
  verbose: true,
};
