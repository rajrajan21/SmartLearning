@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo  OCR for Hindi and Tamil textbooks (free, runs on this PC)
echo  Creates a .ocr.txt next to each Hindi/Tamil PDF.
echo ============================================================
where tesseract >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (set "TESSERACT_EXE=C:\Program Files\Tesseract-OCR\tesseract.exe") else (
    echo Tesseract is not installed. Install it once with:  winget install UB-Mannheim.TesseractOCR
    echo Then run this file again.
    pause & exit /b 1))
python -m pip install --quiet pymupdf pytesseract pillow
if errorlevel 1 (echo Python or pip is missing. Install Python 3 first. & pause & exit /b 1)
if not exist tools\ocr mkdir tools\ocr
python tools\ocr_books.py "%~dp0."
echo.
echo Finished. If something failed, copy the messages above to Claude.
pause
