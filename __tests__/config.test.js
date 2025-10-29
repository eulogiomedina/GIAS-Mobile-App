import Constants from 'expo-constants';

describe('Configuración del entorno Expo', () => {
  it('Debe tener definida API_URL', () => {
    const apiUrl = Constants.expoConfig?.extra?.API_URL;
    expect(apiUrl).toBeDefined();
  });
});
