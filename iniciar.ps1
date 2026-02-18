$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Iniciando Meu Horario Direito em http://localhost:5173 ..."
Write-Host "Pressione Ctrl+C para parar."
Write-Host ""
& node_modules\.bin\vite
