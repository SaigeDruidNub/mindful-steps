@echo off
echo Deploying to Raindrop...
echo.

REM Try to find Node.js in common locations
if exist "C:\Program Files\nodejs\npx.cmd" (
    echo Found Node.js at C:\Program Files\nodejs
    SET PATH=C:\Program Files\nodejs;%PATH%
    goto :deploy
)

if exist "C:\Program Files (x86)\nodejs\npx.cmd" (
    echo Found Node.js at C:\Program Files (x86)\nodejs
    SET PATH=C:\Program Files (x86)\nodejs;%PATH%
    goto :deploy
)

if exist "%APPDATA%\npm\npx.cmd" (
    echo Found Node.js at %APPDATA%\npm
    SET PATH=%APPDATA%\npm;%PATH%
    goto :deploy
)

echo Node.js not found in common locations
echo Please check your Node.js installation
pause
exit /b 1

:deploy
echo Running type check...
npm run type-check
if %ERRORLEVEL% neq 0 (
    echo Type check failed!
    pause
    exit /b 1
)

echo.
echo Deploying to Raindrop...
raindrop build deploy

echo.
echo Deployment complete!
pause