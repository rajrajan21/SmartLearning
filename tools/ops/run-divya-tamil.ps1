$ErrorActionPreference = "Stop"
$Root = "D:\Smart Learning Website"
$Stage = Join-Path $Root "data\divya-audio-stage"
$StageFiles = Join-Path $Stage "files"
$ServePy = Join-Path $Root "tools\tamil-voice-trial\serve.py"
$VenvPy = Join-Path $Root "tools\tamil-voice-trial\venv\Scripts\python.exe"
$Ssh = "C:\Program Files\Git\usr\bin\ssh.exe"
$Scp = "C:\Program Files\Git\usr\bin\scp.exe"
$Key = Join-Path $env:USERPROFILE "Downloads\ssh-key-2026-11-20.key"
$HostAddr = "ubuntu@130.210.8.102"
$ProgressFile = Join-Path $Stage "progress.json"

New-Item -ItemType Directory -Force -Path $StageFiles | Out-Null
Copy-Item (Join-Path $Root "content\audio\voices.json") (Join-Path $Stage "voices.json") -Force
if (Test-Path (Join-Path $Root "content\audio\phrases.json")) {
  Copy-Item (Join-Path $Root "content\audio\phrases.json") (Join-Path $Stage "phrases.json") -Force
}
if (-not (Test-Path (Join-Path $Stage "manifest.json"))) {
  '{"version":1,"entries":{}}' | Set-Content (Join-Path $Stage "manifest.json") -Encoding UTF8
}

function Test-Parler {
  try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8090/api/health" -TimeoutSec 2
    return [bool]$r.tts
  } catch { return $false }
}

if (-not (Test-Parler)) {
  Write-Host "[$(Get-Date -Format s)] Starting Indic Parler-TTS server on port 8090..."
  $outLog = Join-Path $Stage "parler-server.out.log"
  $errLog = Join-Path $Stage "parler-server.err.log"
  Start-Process -FilePath $VenvPy -ArgumentList $ServePy -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
  for ($i = 0; $i -lt 90; $i++) {
    if (Test-Parler) { break }
    Start-Sleep -Seconds 2
  }
  if (-not (Test-Parler)) { throw "Indic Parler-TTS server failed to become healthy on port 8090." }
}
Write-Host "[$(Get-Date -Format s)] Indic Parler-TTS server ready on port 8090."

$env:AUDIO_DIR = $Stage
$env:PARLER_URL = "http://127.0.0.1:8090"

$batches = @(
  "annai-mozhiye",
  "thirukkural-iyal3",
  "tnm-10-tamil-iyal-1",
  "tnm-10-tamil-iyal-2",
  "tnm-10-tamil-iyal-3",
  "tnm-10-tamil-iyal-4",
  "tnm-10-tamil-iyal-5",
  "tnm-10-tamil-iyal-6",
  "tnm-10-tamil-iyal-7",
  "tnm-9-tamil-iyal-1",
  "tnm-9-tamil-iyal-2",
  "tnm-9-tamil-iyal-3",
  "tnm-9-tamil-iyal-4",
  "tnm-9-tamil-iyal-5",
  "tnm-9-tamil-iyal-6",
  "tnm-9-tamil-iyal-7",
  "classroom-10-tamil-",
  "classroom-9-tamil-"
)

$uploaded = @{}
$syncedFile = Join-Path $Stage "synced_keys.txt"
if (Test-Path $syncedFile) {
  Get-Content $syncedFile | ForEach-Object { if ($_) { $uploaded[$_] = $true } }
}

Set-Location $Root
foreach ($b in $batches) {
  Write-Host "`n[$(Get-Date -Format s)] === Divya batch: $b ==="
  pnpm --filter @studysmart/api audio:build --lang ta --voices divya --only $b --jobs 1

  $m = Get-Content (Join-Path $Stage "manifest.json") -Raw | ConvertFrom-Json
  $newEntries = @{}
  $newFiles = New-Object System.Collections.Generic.List[string]
  foreach ($prop in $m.entries.PSObject.Properties) {
    if (-not $uploaded.ContainsKey($prop.Name)) {
      $newEntries[$prop.Name] = $prop.Value
      $mp3Path = Join-Path $StageFiles $prop.Value.file
      if (Test-Path $mp3Path) { $newFiles.Add($mp3Path) }
    }
  }

  if ($newEntries.Count -gt 0) {
    Write-Host "[$(Get-Date -Format s)] Syncing $($newEntries.Count) new Divya clips to Oracle..."
    $patchJson = @{ entries = $newEntries } | ConvertTo-Json -Depth 6
    $patchPath = Join-Path $Stage "batch_patch.json"
    [System.IO.File]::WriteAllText($patchPath, $patchJson, (New-Object System.Text.UTF8Encoding($false)))

    & $Ssh -i $Key -o BatchMode=yes -o ConnectTimeout=15 $HostAddr "rm -rf /tmp/divya-sync && mkdir -p /tmp/divya-sync/files"
    & $Scp -i $Key -o BatchMode=yes -q $patchPath "${HostAddr}:/tmp/divya-sync/patch.json"
    if ($newFiles.Count -gt 0) {
      $maxChunk = [int][Math]::Floor(($newFiles.Count - 1) / 50)
      foreach ($chunkStart in 0..$maxChunk) {
        $slice = $newFiles | Select-Object -Skip ($chunkStart * 50) -First 50
        if ($slice) {
          & $Scp -i $Key -o BatchMode=yes -q @slice "${HostAddr}:/tmp/divya-sync/files/"
        }
      }
    }

    $mergeScript = @'
set -euo pipefail
sudo flock -w 600 /home/ubuntu/sharpstudy-audio-worker/job.lock bash -c '
set -euo pipefail
cp -n /tmp/divya-sync/files/*.mp3 /srv/studysmart/audio/files/ 2>/dev/null || true
chown studysmart:studysmart /srv/studysmart/audio/files/*.mp3 2>/dev/null || true
node -e "
const fs = require(\"fs\");
const p = \"/srv/studysmart/audio/manifest.json\";
const live = JSON.parse(fs.readFileSync(p, \"utf8\"));
const patch = JSON.parse(fs.readFileSync(\"/tmp/divya-sync/patch.json\", \"utf8\"));
let added = 0;
for (const [k, v] of Object.entries(patch.entries || {})) {
  if (!live.entries[k]) { live.entries[k] = v; added++; }
}
fs.writeFileSync(p + \".tmp\", JSON.stringify(live));
fs.renameSync(p + \".tmp\", p);
console.log(\"DIVYA_SYNCED added=\" + added + \" total=\" + Object.keys(live.entries).length);
"
chown studysmart:studysmart /srv/studysmart/audio/manifest.json
'
rm -rf /tmp/divya-sync
sudo systemctl restart studysmart
'@ -replace "`r`n", "`n"
    $mergeScript | & $Ssh -i $Key -o BatchMode=yes -o ConnectTimeout=15 $HostAddr "bash -s"

    $newKeys = @($newEntries.Keys)
    Add-Content -Path $syncedFile -Value $newKeys
    foreach ($k in $newKeys) { $uploaded[$k] = $true }
  }

  $prog = @{
    updatedAt = (Get-Date -Format o)
    lastBatch = $b
    totalDivyaClipsLocal = $m.entries.PSObject.Properties.Count
    totalDivyaSyncedOracle = $uploaded.Count
  } | ConvertTo-Json
  [System.IO.File]::WriteAllText($ProgressFile, $prog, (New-Object System.Text.UTF8Encoding($false)))
}

Write-Host "`n[$(Get-Date -Format s)] ALL DIVYA TAMIL BATCHES COMPLETE!"
