# MCP Agentic Web App

This repository is organized as a small full-stack starter for a web-based MCP-style AI agent application.

## Project layout

- `frontend/`: React and Vite web application.
- `backend/`: Express and TypeScript API for agent orchestration.
- `script/`: Cross-platform container launcher scripts.
- `compose.yaml`: Shared Docker or Podman compose definition.

## Run with containers

1. Copy the environment template:

   ```bash
   copy .env.example .env
   ```

2. Start the services:

   Windows PowerShell:

   ```powershell
   .\script\start-containers.ps1
   ```

   Linux shell:

   ```bash
   ./script/start-containers.sh
   ```

The scripts auto-detect `docker` first and fall back to `podman` when available.

## Services

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8787`

## API routes

- `GET /api/health`
- `GET /api/tools`
- `POST /api/agent/run`
