$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Gerando build de producao..."
& node_modules\.bin\vite build
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build gerado com sucesso na pasta dist/"
    Write-Host "Pronto para upload para o servidor."
} else {
    Write-Host "Erro no build."
}
