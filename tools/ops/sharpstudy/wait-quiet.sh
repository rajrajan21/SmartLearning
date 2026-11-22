#!/usr/bin/env bash
set -euo pipefail
while :; do
  units="$(systemctl list-units --plain --no-legend --state=running,activating 'sharpstudy-*.service' 'studysmart-*.service')"
  if ! awk '{print $1}' <<<"$units" | grep -Ev '^(sharpstudy-quiet-voices|sharpstudy-papers)\.service$|^$' | grep -q .; then exit 0; fi
  sleep 30
done
