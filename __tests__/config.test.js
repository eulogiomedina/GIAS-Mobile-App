import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

describe('Configuración del entorno móvil GIAS', () => {
  test('Expo se inicializa correctamente', () => {
    expect(Platform.OS).toBe('android');
  });

  test('SecureStore funciona con mocks', async () => {
    SecureStore.setItemAsync.mockResolvedValueOnce(true);
    await SecureStore.setItemAsync('token', '12345');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', '12345');
  });
});
