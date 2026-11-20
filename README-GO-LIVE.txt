GO-LIVE (SharpStudy)
Put Go-Live.bat in D:\Smart Learning Website (next to Publish-To-GitHub.bat) and double-click.
 1. Publishes code to GitHub (your Publish-To-GitHub.bat) and verifies GitHub has the latest commit.
 2. SSH to the server and runs update.sh (git pull, build, migrate, restart). Needs your SSH key file only.
 3. Asks Y/N to copy NEW audio (content\audio\files + manifest.json + voices.json) to /srv/studysmart/audio.
    Only files newer than the last copy are sent. Do it only when Generate-Edge-Audio.bat is NOT running.
Safe to repeat. Stops on the first failure and writes go-live-report.txt.
If the audio step says the service name is wrong, tell me the output of:  sudo systemctl list-units | findstr -i study
