#!/usr/bin/env bash
# Pull the latest code, build, update the database, restart. Run on the server after you publish to GitHub:
#   bash /opt/studysmart/deploy/update.sh
set -euo pipefail
cd /opt/studysmart
sudo -u studysmart git pull --ff-only
sudo -u studysmart pnpm install --frozen-lockfile
sudo -u studysmart pnpm --filter @studysmart/web build
set -a; . /etc/studysmart.env; set +a
sudo -E -u studysmart env DATABASE_URL="$DATABASE_URL" pnpm --filter @studysmart/api db:migrate
sudo -E -u studysmart env DATABASE_URL="$DATABASE_URL" pnpm --filter @studysmart/api db:seed
sudo systemctl restart studysmart
sleep 3
curl -fsS "http://127.0.0.1:${PORT:-3100}/health" && echo && echo "StudySmart is running."
