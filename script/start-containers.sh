#!/usr/bin/env sh
set -eu

ENGINE="${1:-auto}"

resolve_engine() {
  if [ "$ENGINE" = "docker" ] || [ "$ENGINE" = "podman" ]; then
    printf "%s" "$ENGINE"
    return
  fi

  if command -v docker >/dev/null 2>&1; then
    printf "docker"
    return
  fi

  if command -v podman >/dev/null 2>&1; then
    printf "podman"
    return
  fi

  echo "Neither docker nor podman is available in PATH." >&2
  exit 1
}

RESOLVED_ENGINE="$(resolve_engine)"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."
echo "Using container engine: $RESOLVED_ENGINE"

if [ "$RESOLVED_ENGINE" = "docker" ]; then
  docker compose -f compose.yaml up --build -d
else
  podman compose -f compose.yaml up --build -d
fi
