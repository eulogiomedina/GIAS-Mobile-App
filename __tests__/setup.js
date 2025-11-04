// Mock global para evitar errores con APIs de Expo durante pruebas
jest.mock('expo', () => ({
  Constants: { manifest: { version: '1.0.0' } },
  Platform: { OS: 'android' },
}));
