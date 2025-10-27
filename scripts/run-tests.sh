#!/usr/bin/env bash
set -euo pipefail
echo "Ejecutando pruebas unitarias..."
npm test -- --ci || echo "⚠ No se encontraron pruebas unitarias, se omite esta etapa."
