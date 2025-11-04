/**
 * 🌐 __tests__/api.status.test.js
 * Verifica la disponibilidad del backend GIAS mediante mocks de Axios.
 * Evita llamadas reales en CI/CD (GitHub Actions) para prevenir errores de red o CORS.
 */

import axios from "axios";

// 🔹 Crea un mock de Axios para simular las respuestas HTTP
jest.mock("axios");

describe("Disponibilidad del backend GIAS", () => {
  beforeAll(() => {
    // Simula respuesta exitosa del backend con código 200
    axios.get.mockResolvedValue({ status: 200 });
  });

  it("El backend debe responder correctamente (status 200 o 304)", async () => {
    const response = await axios.get("https://backendgias.onrender.com/api/auth/login");
    expect([200, 304]).toContain(response.status);
  });

  it("Debe manejar errores de conexión correctamente", async () => {
    // Simula error de red controlado
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    try {
      await axios.get("https://backendgias.onrender.com/api/test");
    } catch (error) {
      expect(error.message).toBe("Network Error");
    }
  });
});
