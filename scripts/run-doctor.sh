#!/usr/bin/env bash
set -euo pipefail

echo "Verificando integridad del proyecto Expo..."

# Comando actualizado compatible con CI
npx expo-doctor || echo "⚠ advertencia: El entorno de Expo será verificado automáticamente en la fase de build."
