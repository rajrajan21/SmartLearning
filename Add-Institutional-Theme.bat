@echo off
setlocal
title SharpStudy - Official Editorial theme, palettes, scroll aids
cd /d "%~dp0"
where node >nul 2>nul || ( echo STOPPED: Node.js not found. & goto :end )
attrib -R "packages\shared\src\look.ts" "packages\shared\src\settings.ts" "apps\web\src\themes.css" "apps\web\src\styles.css" "apps\web\src\lib\i18n.ts" "apps\web\src\components\Layout.tsx" >nul 2>&1
node tools\apply-institutional-theme.mjs
if errorlevel 1 ( echo. & echo STOPPED: nothing was changed. Tell Claude what the message above says. ) else ( echo. & echo DONE. Restart the site, press Ctrl+F5, then Admin - Look and feel. )
:end
echo.
pause
endlocal
