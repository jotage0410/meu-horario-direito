$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Node:" (& node --version)
Write-Host "npm:" (& npm --version)
Write-Host ""
Write-Host "Instalando dependencias..."
npm install
Write-Host ""
Write-Host "Instalacao concluida!"
Write-Host "Para iniciar o servidor de desenvolvimento, execute:"
Write-Host "  npm run dev"
