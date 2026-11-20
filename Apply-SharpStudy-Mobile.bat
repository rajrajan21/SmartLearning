@echo off
setlocal
set "REPO=D:\Smart Learning Website"
if not "%~1"=="" set "REPO=%~1"
where git >nul 2>nul
if errorlevel 1 (
  echo Git for Windows is required.
  exit /b 1
)
if not exist "%REPO%\apps\web\src\components\Layout.tsx" (
  echo SharpStudy source not found in "%REPO%".
  exit /b 1
)
pushd "%REPO%" || exit /b 1
git apply --check "%~dp0sharpstudy-mobile.patch"
if errorlevel 1 (
  echo No changes were applied. Confirm this checkout already contains the layout gallery rollout.
  popd
  exit /b 1
)
git apply "%~dp0sharpstudy-mobile.patch"
if errorlevel 1 (
  popd
  exit /b 1
)
echo Applied the SharpStudy mobile and Classroom pack. No files were staged, published or deployed.
popd
exit /b 0
