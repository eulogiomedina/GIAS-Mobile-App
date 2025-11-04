/**
 * 🧩 setup.js — Configuración base para entorno de pruebas Jest + Expo
 * Corrige dependencias nativas y evita errores de red en entorno CI/CD (Expo 54 + Jest + jsdom)
 */

//
// 🧱 Polyfills esenciales para compatibilidad con Expo y JSDOM
//
if (typeof global.__ExpoImportMetaRegistry === "undefined") {
  Object.defineProperty(global, "__ExpoImportMetaRegistry", {
    get: () => undefined,
    set: () => {},
  });
}

if (typeof global.TextDecoderStream === "undefined") global.TextDecoderStream = function () {};
if (typeof global.TextEncoderStream === "undefined") global.TextEncoderStream = function () {};
if (typeof global.ReadableStream === "undefined") global.ReadableStream = function () {};

// ✅ Polyfills adicionales requeridos por Expo Winter Runtime
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = class {
    decode(value) {
      return value ? value.toString() : "";
    }
  };
}

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = class {
    encode(value) {
      return new Uint8Array(Buffer.from(value || "", "utf-8"));
    }
  };
}

if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

//
// 🧪 Mocks globales de módulos Expo y APIs nativas
//
jest.mock("expo", () => ({
  Constants: { manifest: { version: "1.0.0" } },
  Platform: { OS: "android" },
  Device: { isDevice: true },
}));

jest.mock("expo-constants", () => ({
  manifest: { version: "1.0.0" },
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "giasmobileapp://home"),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-random", () => ({
  getRandomBytesAsync: jest.fn(() => new Uint8Array([1, 2, 3, 4])),
}));

//
// 🧍 Mock específico para Platform (React Native)
//
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "android",
  select: (objs) => objs.android,
}));

//
// 🌐 Mock global de fetch para evitar errores de red o CORS en CI/CD
//
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Mocked fetch OK" }),
  })
);

//
// 🚫 Supresión de warnings/errores innecesarios en consola
//
const originalError = console.error;
global.console = {
  ...console,
  warn: jest.fn(),
  error: (...args) => {
    // Ignora errores "Cross origin" del entorno jsdom
    if (typeof args[0] === "string" && args[0].includes("Cross origin")) return;
    originalError(...args);
  },
};

//
// ✅ Corrección final para Platform.OS en Jest + React Native
// Fuerza la simulación a "android" incluso si React Native se inicializa antes del mock.
//
try {
  const rnPlatform = require("react-native/Libraries/Utilities/Platform");
  rnPlatform.OS = "android";
  rnPlatform.select = (objs) => objs.android;

  const expo = require("expo");
  if (expo.Platform) expo.Platform.OS = "android";

  console.log("✅ Platform forzado correctamente a 'android' en entorno de pruebas.");
} catch (err) {
  console.warn("⚠️ No se pudo aplicar el override de Platform:", err.message);
}

//
// 🟢 Confirmación visual en consola (útil en CI/CD)
//
console.log("✅ Entorno de pruebas inicializado correctamente.");
