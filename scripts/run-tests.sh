#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Ejecutando pruebas automatizadas con Jest (modo CI)..."

if npm run test:ci; then
  echo "✅ Todas las pruebas pasaron exitosamente."
else
  echo "❌ Algunas pruebas fallaron o no se encontraron."
  exit 1
fi
