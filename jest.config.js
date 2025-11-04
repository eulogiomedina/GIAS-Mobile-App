/**
 * 🧪 Configuración de Jest para la app móvil GIAS (Expo + React Native)
 * Integra mocks, polyfills y entorno jsdom para pruebas de UI, lógica y CI/CD.
 */

const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  // Usa el preset oficial de Expo
  preset: 'jest-expo',

  // Entorno simulado tipo navegador (requerido por Testing Library)
  testEnvironment: 'jsdom',

  // Archivos que se cargan antes de ejecutar cualquier test (mocks globales)
  setupFiles: ['<rootDir>/setup.js'],

  // Archivos que se ejecutan después de inicializar el entorno de Jest
  setupFilesAfterEnv: [
    '<rootDir>/setupTests.js', // hooks globales (beforeAll, afterEach)
    '@testing-library/jest-native/extend-expect', // aserciones para UI
  ],

  // Ignora transformaciones innecesarias de dependencias nativas
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
      ')',
  ],

  // Mapea extensiones estáticas (imágenes, íconos, SVG) para Jest
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.(jpg|jpeg|png|gif|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Tipos de archivos que Jest debe reconocer
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignora carpetas del entorno nativo
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],

  // Limpia mocks entre pruebas
  clearMocks: true,

  // Evita fallos por cobertura incompleta en entorno CI/CD
  collectCoverage: false,

  // Muestra detalle de cada test ejecutado
  verbose: true,

  // ✅ Asegura compatibilidad con Metro Bundler y Jest
moduleDirectories: ['node_modules', ...defaultConfig.resolver.sourceExts],
};
