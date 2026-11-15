# Putting SharpStudy online (free, on your Oracle server)

This runs SharpStudy next to chennaideals.in on the same Oracle Always Free machine. It uses its own port (3100), its own PostgreSQL database and its own Caddy block, so it does not touch the other site. Total cost: Rs 0 (you already pay only for the domain).

## Before you start
1. Domain `sharpstudy.in`: in your domain's DNS add an **A record** for `sharpstudy.in` and `www` pointing to your Oracle server's public IP (the same IP chennaideals.in uses).
2. Your code must be on GitHub (run `Publish-To-GitHub.bat`). If the repository is private, make it public or add a deploy key; the simplest free choice is a public repository (it holds no secrets: keys live only in `/etc/studysmart.env`).
3. Log in to the server with SSH (the same way you do for chennaideals.in).

## One-time setup (about 15 minutes)
```
curl -fsSL https://raw.githubusercontent.com/rajrajan21/SmartLearning/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh
```
It installs Node.js, pnpm and PostgreSQL, creates the database and prints a **database password**.

Then edit the settings file:
```
sudo nano /etc/studysmart.env
```
Put the database password into `DATABASE_URL`, and set `ADMIN_KEY` to a long random text (make one with `openssl rand -base64 36`). Keep that text safe: it is your password for the admin page at `sharpstudy.in/admin`.

Build and start it:
```
bash /opt/studysmart/deploy/update.sh
```
Open the firewall for web traffic only if it is not already open (chennaideals.in already uses ports 80 and 443, so it normally is).

Last, add the block from `deploy/Caddyfile` to the Caddyfile you already use, then:
```
sudo systemctl reload caddy
```
Visit https://sharpstudy.in. Caddy gets the HTTPS certificate by itself.

## Every time you change something
1. On your laptop: run `Publish-To-GitHub.bat`.
2. On the server: `bash /opt/studysmart/deploy/update.sh`.

## Backups
```
sudo crontab -e
```
add the line `30 2 * * * bash /opt/studysmart/deploy/backup.sh`. Backups are kept for 14 days in `/var/backups/studysmart`. Copy one to your laptop now and then.

## Checking it works
- `curl http://127.0.0.1:3100/health` on the server shows `{"status":"ok"...}`.
- `sudo systemctl status studysmart` and `sudo journalctl -u studysmart -n 50` show the program and its messages.
- Sign in at `/admin` with your ADMIN_KEY to change any setting.

## Teacher voice
Lesson audio files are made on your laptop by `Generate-Lesson-Audio.bat` (needs Malar Teacher running) and published with the code, so the server never needs a voice program.

## Keeping the server safe
- Never put `ADMIN_KEY` or API keys in GitHub.
- Run `sudo apt-get update && sudo apt-get upgrade -y` now and then.

## A parent forgot the password
No e-mail service is needed (it keeps the site free). After you confirm it really is the parent, on the server:
```
set -a; . /etc/studysmart.env; set +a
cd /opt/studysmart && pnpm --filter @studysmart/api account:reset-password -- parent@example.com
```
It prints a temporary password once and signs the parent out everywhere. Send it to the parent privately.
