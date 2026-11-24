$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$server = Join-Path $root 'server'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is not installed or is not on PATH. Install Node.js 18+ and reopen PowerShell.' }
if (-not (Test-Path (Join-Path $server '.env'))) {
  Copy-Item (Join-Path $server '.env.example') (Join-Path $server '.env')
  Write-Host 'Created server\.env. Open it and set MYSQL_PASSWORD to your actual MySQL password, then run .\start.ps1 again.' -ForegroundColor Yellow
  notepad (Join-Path $server '.env')
  exit 1
}
Push-Location $server
try {
  if (-not (Test-Path (Join-Path $server 'node_modules'))) { npm install }
  npm start
} finally { Pop-Location }
