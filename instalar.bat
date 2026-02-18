@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo Node version:
node --version
echo npm version:
npm --version
echo.
echo Instalando dependencias...
npm install
echo.
echo Pronto! Para iniciar o servidor, execute:
echo npm run dev
pause
