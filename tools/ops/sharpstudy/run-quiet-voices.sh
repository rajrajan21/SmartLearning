#!/usr/bin/env bash
set -euo pipefail
umask 077
dir="$(cd -- "$(dirname -- "$0")" && pwd)"
engine="$dir/engine"
app=/opt/studysmart
cd "$app"
echo 'Waiting for Oracle to be idle'
/usr/bin/bash "$dir/wait-quiet.sh"
if [[ ! -f "$engine/node_modules/@met4citizen/headtts/modules/headtts-node.mjs" ]]; then
  sudo -u ubuntu npm --prefix "$engine" ci --ignore-scripts --no-audit --no-fund
fi
sudo -u ubuntu env PORT=18180 TTS_PORT=18882 TTS_WORKERS=1 TTS_THREADS=1 TTS_DEVICE=cpu TTS_DTYPE=fp32 /usr/bin/node "$engine/server.mjs" &
engine_pid=$!
trap 'kill "$engine_pid" 2>/dev/null || true' EXIT
node --input-type=module - <<'JS'
const address = "http://127.0.0.1:18180";
for (let i = 0; ; i++) {
  if (i >= 120) throw Error("Kokoro did not load both voices");
  const health = await fetch(address + "/api/health").then(response => response.json()).catch(() => null);
  if (health?.tts && ["hf_beta", "hm_psi"].every(voice => health.voices.includes(voice))) break;
  await new Promise(resolve => setTimeout(resolve, 5000));
}
for (const voice of ["hf_beta", "hm_psi"]) {
  const response = await fetch(address + "/api/speak", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text: "Let us work through this example.", voice, speed: 0.92 }),
    signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  if (!response.ok || Buffer.from(data.audio ?? "", "base64").toString("ascii", 0, 4) !== "RIFF") throw Error("Failed to verify " + voice);
  console.log("Verified", voice);
}
JS
export SHARPSTUDY_EDGE_HELPER="$dir/speak-kokoro-queue.py"
export SHARPSTUDY_TTS_WAIT=1
tsx=apps/api/node_modules/tsx/dist/cli.mjs
worker() { sudo -u ubuntu --preserve-env=SHARPSTUDY_VOICE_ID,SHARPSTUDY_EDGE_HELPER,SHARPSTUDY_TTS_WAIT node "$tsx" "$@"; }
coverage_complete() { node -e 'const d=require(process.argv[1]);if(d.exceptions.length||d.phases.some(p=>p.staged||p.missing))process.exit(1)' "$1"; }
for voice in priya2 ravi2; do
  export SHARPSTUDY_VOICE_ID="$voice"
  worker "$dir/plan-kani-queue.mts" "$dir/$voice"
  for pass in 1 2; do
    for grade in 6 7 3 4 9 10 5 8; do
      phase="$dir/$voice/grade-$grade"
      test "$(cat "$phase/worked-step-lines.json")" != '[]' || continue
      /usr/bin/bash "$dir/wait-quiet.sh"
      printf '%s Grade %s %s\n' "$(date -Is)" "$grade" "$voice"
      if ! worker "$dir/worked-step-release-audio.mts" "$phase" generate; then
        sleep 30
        worker "$dir/worked-step-release-audio.mts" "$phase" generate
      fi
      /usr/bin/bash "$dir/wait-quiet.sh"
      flock -w 600 /home/ubuntu/sharpstudy-audio-worker/job.lock node "$tsx" "$dir/worked-step-release-audio.mts" "$phase" publish
    done
    worker "$dir/plan-kani-queue.mts" "$dir/$voice"
    if coverage_complete "$dir/$voice/coverage.json"; then break; fi
  done
  coverage_complete "$dir/$voice/coverage.json"
done
