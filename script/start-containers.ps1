param(
    [ValidateSet("auto", "docker", "podman")]
    [string]$Engine = "auto"
)

function Resolve-ComposeEngine {
    param([string]$Requested)

    if ($Requested -eq "docker") { return "docker" }
    if ($Requested -eq "podman") { return "podman" }

    if (Get-Command docker -ErrorAction SilentlyContinue) { return "docker" }
    if (Get-Command podman -ErrorAction SilentlyContinue) { return "podman" }

    throw "Neither docker nor podman is available in PATH."
}

$resolvedEngine = Resolve-ComposeEngine -Requested $Engine
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))
Write-Host "Using container engine: $resolvedEngine"

if ($resolvedEngine -eq "docker") {
    & docker compose -f compose.yaml up --build -d
} else {
    & podman compose -f compose.yaml up --build -d
}
