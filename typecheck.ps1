$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Verificando TypeScript..."
& node_modules\.bin\tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript OK!"
} else {
    Write-Host "Erros de TypeScript encontrados acima."
}
