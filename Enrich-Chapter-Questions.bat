@echo off
setlocal
cd /d "%~dp0"
echo Running SharpStudy Online Question Enrichment Pipeline...
node tools\papers\enrich-chapter-questions.mjs %*
echo.
echo Report written to: %~dp0questions-enrich-report.txt
pause
