#!/usr/bin/env bash
# One-time setup of SharpStudy on the Oracle Ubuntu server. Run as a normal user with sudo:  bash setup-server.sh
# Safe to re-run. It does NOT touch chennaideals.in (its own Caddy block, its own port 3100, its own database).
set -euo pipefail
REPO="${REPO:-https://github.com/rajrajan21/SmartLearning.git}"
APP=/opt/studysmart

echo "== Node.js 22 and pnpm =="
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo npm install -g pnpm@9.15.0

echo "== PostgreSQL =="
sudo apt-get install -y postgresql
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='studysmart'" | grep -q 1; then
  PW=$(openssl rand -hex 16)
  sudo -u postgres psql -c "CREATE USER studysmart WITH PASSWORD '$PW';"
  sudo -u postgres psql -c "CREATE DATABASE studysmart OWNER studysmart;"
  echo "Database password (put it in /etc/studysmart.env): $PW"
fi

echo "== App user and code =="
id studysmart >/dev/null 2>&1 || sudo useradd --system --create-home --shell /usr/sbin/nologin studysmart
[ -d "$APP/.git" ] || sudo git clone "$REPO" "$APP"
sudo chown -R studysmart:studysmart "$APP"

echo "== Service =="
[ -f /etc/studysmart.env ] || { sudo cp "$APP/deploy/studysmart.env.example" /etc/studysmart.env; sudo chmod 600 /etc/studysmart.env; echo "EDIT /etc/studysmart.env now (database password, ADMIN_KEY)."; }
sudo cp "$APP/deploy/studysmart.service" /etc/systemd/system/studysmart.service
sudo systemctl daemon-reload
sudo systemctl enable studysmart
echo "Next: edit /etc/studysmart.env, then run:  bash $APP/deploy/update.sh"
echo "Then add deploy/Caddyfile's block to your Caddyfile and run: sudo systemctl reload caddy"
