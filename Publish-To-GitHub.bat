@echo off
setlocal
title SharpStudy - Publish to GitHub
cd /d "%~dp0"
set "LOG=%~dp0publish-github-report.txt"
set "REMOTE=https://github.com/rajrajan21/SmartLearning.git"

echo SharpStudy publish started %date% %time% > "%LOG%"
echo.
echo  === SharpStudy: save and push to GitHub (rajrajan21/SmartLearning) ===
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

rem Refresh the Malar Teacher copy (source only: no node_modules, cache, big asset zips or videos)
set "MALAR_SRC=%~dp0Malar Teacher"
if not exist "%MALAR_SRC%\server.mjs" set "MALAR_SRC=%USERPROFILE%\Documents\Malar Teacher"
if exist "%MALAR_SRC%\server.mjs" (
  echo Updating Malar Teacher copy from %MALAR_SRC% ...
  robocopy "%MALAR_SRC%" "%~dp0malar-teacher" /E /XD node_modules cache clips _backup _build screenshots voices .git /XF *.bat *.zip *.mp4 *.bin *.log /NFL /NDL /NJH /NJS /NP >> "%LOG%" 2>&1
  if errorlevel 8 (
    echo WARNING: could not copy Malar Teacher. See publish-github-report.txt
  )
) else (
  echo Malar Teacher folder not found at %MALAR_SRC% - skipping it.
)

echo Keeping big local-only files out of git (voice cache, archives)...
for %%P in ("Malar Teacher/" "*.tgz" "__pycache__/" "*.pyc" ".transfer/" "malar-teacher/cache/") do (
  findstr /x /c:%%P .gitignore >nul 2>&1 || echo %%~P>> .gitignore
)
git config http.postBuffer 524288000
rem If an earlier unpushed commit swallowed big files, redo it on top of the last pushed state (no force push)
git rev-parse --verify -q origin/main >nul 2>&1 && git reset --soft origin/main >> "%LOG%" 2>&1
git rm -r --cached -q --ignore-unmatch ".transfer" "sync*.tgz" "*__pycache__*" "*.pyc" "Malar Teacher" "malar-teacher/cache" >> "%LOG%" 2>&1
echo Adding changes...
git add -A >> "%LOG%" 2>&1

set "MSG=%~1"
if "%MSG%"=="" set "MSG=SharpStudy update %date% %time%"
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
