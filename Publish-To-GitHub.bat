@echo off
setlocal
title StudySmart - Publish to GitHub
cd /d "%~dp0"
set "LOG=%~dp0publish-github-report.txt"
set "REMOTE=https://github.com/rajrajan21/SmartLearning.git"

echo StudySmart publish started %date% %time% > "%LOG%"
echo.
echo  === StudySmart: save and push to GitHub (rajrajan21/SmartLearning) ===
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo STOPPED: Git is not installed. Install Git for Windows from https://git-scm.com then run this again.
  echo STOPPED: git not installed >> "%LOG%"
  goto :end
)

if not exist ".git" (
  git init -b main >> "%LOG%" 2>&1
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin %REMOTE% >> "%LOG%" 2>&1
) else (
  git remote set-url origin %REMOTE% >> "%LOG%" 2>&1
)

rem Make sure there is a commit identity (only set if missing, local to this repo)
git config user.name >nul 2>&1 || git config user.name "rajrajan21"
git config user.email >nul 2>&1 || git config user.email "itsme.rajrajan@gmail.com"

git branch -M main >> "%LOG%" 2>&1

echo Adding changes...
git add -A >> "%LOG%" 2>&1

set "MSG=%~1"
if "%MSG%"=="" set "MSG=StudySmart update %date% %time%"
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%MSG%" >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo STOPPED: commit failed. See publish-github-report.txt
    echo STOPPED: commit failed >> "%LOG%"
    goto :end
  )
) else (
  echo Nothing new to commit. Pushing existing commits.
)

echo Pushing to GitHub. A sign-in window may open the first time - sign in there.
git push -u origin main >> "%LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo STOPPED: push failed. Open publish-github-report.txt to see why.
  echo If GitHub says the remote has other work, tell Claude - do NOT force push.
  echo STOPPED: push failed >> "%LOG%"
  goto :end
)

echo DONE: pushed to %REMOTE% >> "%LOG%"
echo.
echo  DONE. Your code is now on GitHub:
echo  https://github.com/rajrajan21/SmartLearning

:end
echo.
pause
endlocal
