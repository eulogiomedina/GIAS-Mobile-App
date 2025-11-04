// Mock global para Expo y APIs nativas que fallan en Jest
jest.mock('expo', () => ({
  Constants: { manifest: { version: '1.0.0' } },
  Platform: { OS: 'android' },
  Device: { isDevice: true },
}));

jest.mock('expo-constants', () => ({
  manifest: { version: '1.0.0' },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'giasmobileapp://home'),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-random', () => ({
  getRandomBytesAsync: jest.fn(() => new Uint8Array([1, 2, 3, 4])),
}));
