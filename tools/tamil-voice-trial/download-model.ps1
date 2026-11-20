# Downloads the Indic Parler-TTS voice model with Windows curl (Python cannot reach huggingface.co on this PC).
$ErrorActionPreference = 'Stop'
$base = Join-Path $PSScriptRoot 'model'
$indic = Join-Path $base 'indic'
$t5 = Join-Path $base 't5tok'
New-Item -ItemType Directory -Force $indic, $t5 | Out-Null
$sec = Read-Host 'Paste your Hugging Face READ token here and press Enter (it will not show on screen)' -AsSecureString
$tok = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if (-not $tok) { Write-Host 'No token entered.'; exit 1 }
$h = @{ Authorization = "Bearer $tok" }
$listFile = Join-Path $base 'files.json'
& curl.exe --ssl-no-revoke --retry 25 --retry-all-errors --retry-delay 3 -L -s --fail -H "Authorization: Bearer $tok" -o $listFile 'https://huggingface.co/api/models/ai4bharat/indic-parler-tts/tree/main?recursive=true'
if ($LASTEXITCODE -ne 0) {
  Write-Host "Could not list the model files (curl code $LASTEXITCODE). Check the token (type Read) and that you accepted the model terms."; exit 1
}
$files = Get-Content $listFile -Raw | ConvertFrom-Json
foreach ($f in $files) {
  if ($f.type -ne 'file') { continue }
  if ($f.path -match '\.(md|png|jpg|jpeg|gif)$' -or $f.path -eq '.gitattributes') { continue }
  $dest = Join-Path $indic ($f.path -replace '/', '\')
  New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -eq $f.size)) { Write-Host "have $($f.path)"; continue }
  Write-Host "downloading $($f.path) ($([math]::Round($f.size/1MB)) MB) ..."
  & curl.exe --ssl-no-revoke --retry 25 --retry-all-errors --retry-delay 3 -L --fail -C - -H "Authorization: Bearer $tok" -o $dest "https://huggingface.co/ai4bharat/indic-parler-tts/resolve/main/$($f.path)"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: $($f.path). Run this again to resume."; exit 1 }
}
# prompt-description tokenizer (small, public)
$te = 'google/flan-t5-large'
try { $cfg = Get-Content (Join-Path $indic 'config.json') -Raw | ConvertFrom-Json; if ($cfg.text_encoder._name_or_path) { $te = $cfg.text_encoder._name_or_path } } catch {}
Write-Host "downloading tokenizer files of $te ..."
foreach ($n in 'config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','spiece.model') {
  & curl.exe --ssl-no-revoke --retry 25 --retry-all-errors --retry-delay 3 -L -s --fail -o (Join-Path $t5 $n) "https://huggingface.co/$te/resolve/main/$n"
  if ($LASTEXITCODE -ne 0) { Remove-Item (Join-Path $t5 $n) -ErrorAction SilentlyContinue }
}
Write-Host 'Model downloaded. Now run Try-Tamil-Teacher-Voice.bat'
