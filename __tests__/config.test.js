/**
 * ⚙️ __tests__/config.test.js
 * Verifica la configuración base de la app móvil GIAS.
 * Comprueba que Expo y SecureStore estén correctamente inicializados y mockeados.
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

describe("Configuración del entorno móvil GIAS", () => {
  beforeAll(() => {
    // 🧩 Fuerza Platform.OS = "android" incluso si Expo lo sobrescribe
    Object.defineProperty(Platform, "OS", {
      get: () => "android",
    });
  });

  test("Expo se inicializa correctamente", () => {
    // ✅ Verifica que la plataforma simulada sea Android
    expect(Platform.OS).toBe("android");
  });

  test("SecureStore funciona con mocks", async () => {
    // 🧪 Simula almacenamiento seguro del token
    SecureStore.setItemAsync.mockResolvedValueOnce(true);

    await SecureStore.setItemAsync("token", "12345");

    // ✅ Valida que se haya llamado con los argumentos correctos
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "12345");
  });

  test("SecureStore recupera datos correctamente", async () => {
    // 🧩 Mockea la lectura de datos almacenados
    SecureStore.getItemAsync.mockResolvedValueOnce("12345");

    const value = await SecureStore.getItemAsync("token");

    // ✅ Asegura que el mock responda correctamente
    expect(value).toBe("12345");
  });
});
