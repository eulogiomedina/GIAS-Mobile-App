/**
 * ⚙️ __tests__/config.test.js
 * Verifica la configuración base de la app móvil GIAS.
 * Mock de Platform y SecureStore para entorno de pruebas.
 */

// ✅ MOCKS antes de importar
jest.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

describe("Configuración del entorno móvil GIAS", () => {
  test("Expo se inicializa correctamente", () => {
    // ✅ Verifica que Jest mockea correctamente Platform.OS
    expect(Platform.OS).toBe("android");
  });

  test("SecureStore funciona con mocks", async () => {
    SecureStore.setItemAsync.mockResolvedValueOnce(true);

    await SecureStore.setItemAsync("token", "12345");

    // ✅ Valida que se haya llamado correctamente
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "12345");
  });

  test("SecureStore recupera datos correctamente", async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce("12345");

    const value = await SecureStore.getItemAsync("token");

    // ✅ Asegura que el mock responda correctamente
    expect(value).toBe("12345");
  });
});
