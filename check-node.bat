@echo off
echo Checking Node.js installation...

echo Checking common locations...
if exist "C:\Program Files\nodejs\node.exe" (
    echo Found: C:\Program Files\nodejs\node.exe
    echo Found: C:\Program Files\nodejs\npx.cmd
    goto :test
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo Found: C:\Program Files (x86)\nodejs\node.exe
    echo Found: C:\Program Files (x86)\nodejs\npx.cmd
    goto :test
)

if exist "%APPDATA%\npm\npx.cmd" (
    echo Found: %APPDATA%\npm\npx.cmd
    goto :test
)

echo Node.js not found in standard locations
echo Please check your Node.js installation
pause
exit /b 1

:test
echo.
echo Testing npx...
"C:\Program Files\nodejs\npx.cmd" --version
if %ERRORLEVEL% neq 0 (
    echo npx test failed
    pause
    exit /b 1
)

echo npx is working! You can now run:
echo raindrop build deploy
pause