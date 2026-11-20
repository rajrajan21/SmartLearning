@echo off
setlocal
title SharpStudy - real-browser mode for question papers
cd /d "%~dp0"
rem Only needed if a paper website blocks plain downloads. Uses your installed Google Chrome (nothing big is downloaded).
where node >nul 2>&1 || ( echo STOPPED: install Node.js first. & goto :end )
cd tools\papers
if not exist package.json echo {"name":"papers-browser","private":true,"type":"module"}> package.json
call npm install playwright-core --no-audit --no-fund
echo.
echo Done. Now turn on "Use the real browser" in Admin ^> Question papers. It opens Chrome at human speed and never tries to pass a CAPTCHA or sign-in.
:end
pause
endlocal
