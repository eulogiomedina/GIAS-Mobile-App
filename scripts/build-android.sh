#!/usr/bin/env bash
set -euo pipefail

PROFILE=${1:-preview}  # preview o production

echo "Iniciando build con perfil: $PROFILE"
which eas >/dev/null 2>&1 || npm i -g eas-cli

eas build --platform android --profile $PROFILE --non-interactive
