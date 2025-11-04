import { act } from "@testing-library/react-native";

describe("🔐 Pruebas del módulo de Login – App Móvil GIAS", () => {
  beforeEach(() => {
    // Reinicia el mock antes de cada prueba
    global.fetch.mockClear();
  });

  test("Login exitoso devuelve token y mensaje", async () => {
    // 🔹 Simula respuesta exitosa del backend
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mocked_token_123", message: "Inicio de sesión correcto" }),
    });

    const correo = "usuario@gias.com";
    const password = "123456";

    let data;
    await act(async () => {
      const response = await fetch("https://backendgias.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      data = await response.json();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(data.token).toBe("mocked_token_123");
    expect(data.message).toBe("Inicio de sesión correcto");
  });

  test("Login fallido muestra error de credenciales", async () => {
    // 🔹 Simula respuesta con error 401
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Credenciales inválidas" }),
    });

    const correo = "usuario@gias.com";
    const password = "wrongpassword";

    let data;
    await act(async () => {
      const response = await fetch("https://backendgias.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      data = await response.json();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(data.error).toBe("Credenciales inválidas");
  });
});
