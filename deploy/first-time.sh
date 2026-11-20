#!/usr/bin/env bash
# One-time, hands-off install on a brand-new Oracle Ubuntu 22.04 server (run by Server-First-Time-Setup.bat). Safe to re-run.
set -euo pipefail
APP=/opt/studysmart
bash_dir=$(mktemp -d)
sudo apt-get update -y
sudo apt-get install -y ffmpeg git curl debian-keyring debian-archive-keyring apt-transport-https gpg openssl
# 1) code + node + postgres + service (setup-server.sh needs the repo, so fetch it first)
REPO="${REPO:-https://github.com/rajrajan21/SmartLearning.git}"
[ -d "$APP/.git" ] || { sudo git clone "$REPO" "$APP"; }
bash "$APP/deploy/setup-server.sh" | tee "$bash_dir/setup.log"
# 2) /etc/studysmart.env with generated secrets (only when still the template)
if sudo grep -q CHANGE_ME /etc/studysmart.env; then
  DBPW=$(grep -o 'Database password.*: .*' "$bash_dir/setup.log" | awk '{print $NF}' || true)
  if [ -z "$DBPW" ]; then
    DBPW=$(openssl rand -hex 16)
    sudo -u postgres psql -c "ALTER USER studysmart WITH PASSWORD '$DBPW';"
  fi
  KEY=$(openssl rand -base64 36 | tr -d '/+=\n')
  sudo sed -i "s|postgres://studysmart:CHANGE_ME@|postgres://studysmart:$DBPW@|; s|^ADMIN_KEY=CHANGE_ME|ADMIN_KEY=$KEY|" /etc/studysmart.env
  echo "=================================================="
  echo "ADMIN KEY (save it in your password manager, shown once):"
  echo "$KEY"
  echo "Admin sign-in id: itsme.rajrajan@gmail.com   page: https://sharpstudy.in/admin"
  echo "=================================================="
fi
# 3) Caddy (HTTPS)
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y && sudo apt-get install -y caddy
fi
sudo cp "$APP/deploy/Caddyfile" /etc/caddy/Caddyfile
sudo systemctl enable caddy && sudo systemctl reload caddy || sudo systemctl restart caddy
# 4) open web ports in the server firewall (Oracle Ubuntu images block them by default)
sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent >/dev/null 2>&1 || true
sudo netfilter-persistent save >/dev/null 2>&1 || true
# 5) nightly database backup
( sudo crontab -l 2>/dev/null | grep -v studysmart/deploy/backup.sh; echo "30 2 * * * bash /opt/studysmart/deploy/backup.sh" ) | sudo crontab -
# 6) build + start
bash "$APP/deploy/update.sh"
echo "SharpStudy installed. Open https://sharpstudy.in"
