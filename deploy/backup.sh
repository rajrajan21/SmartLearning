#!/usr/bin/env bash
# Nightly database backup. Keeps the last 14 days in /var/backups/studysmart. Free.
#   sudo crontab -e   then add:   30 2 * * * bash /opt/studysmart/deploy/backup.sh
set -euo pipefail
DIR=/var/backups/studysmart; mkdir -p "$DIR"
sudo -u postgres pg_dump studysmart | gzip > "$DIR/studysmart-$(date +%F).sql.gz"
find "$DIR" -name 'studysmart-*.sql.gz' -mtime +14 -delete
