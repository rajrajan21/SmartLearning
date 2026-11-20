#!/bin/bash
# usage: mk.sh N "note"  -> archive of files changed since marker, append dated doc lines
cd "$(dirname "$0")/../.."; N=$1; NOTE=$2; M=tools/matric_deep/.marker; [ -f $M ] || touch -d '2 hours ago' $M
find content/lessons content/questions apps/web/public/assets/lessons tools/matric_deep -type f -newer $M ! -name .marker ! -name '*.pyc' \( -path '*/tools/matric_deep/*' -o -name 'tnm-*' \) > /tmp/mdfiles.txt
tar czf _to_delete/sync-matric-deep-$N.tgz -T /tmp/mdfiles.txt && wc -l < /tmp/mdfiles.txt
[ -n "$NOTE" ] && D=$(date +%F) && for f in HANDOVER.md JOBS_AND_IMPACT.md CONVERSATION_HISTORY.md; do printf '\n- %s (Matric deepening fork, sync-matric-deep-%s): %s\n' "$D" "$N" "$NOTE" >> $f; done
touch $M
