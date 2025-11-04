/**
 * 🧪 setupTests.js — Configuración posterior al entorno Jest
 * Se ejecuta después de inicializar JSDOM y mocks globales.
 */

beforeEach(() => {
  // Resetea timers, mocks y datos previos
  jest.clearAllMocks();
  jest.useRealTimers();
});

afterEach(() => {
  // Limpieza final entre pruebas
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

console.log("✅ Entorno de pruebas inicializado correctamente.");

