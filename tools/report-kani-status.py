"""Send a bounded summary of an existing Kani build log. Run beside the build."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import urllib.parse
import urllib.request


def summarize(text, stamp):
    phase = None
    status, error = "unknown", None
    completed = total = None
    for line in text.splitlines():
        match = re.search(r"=== Priority: ([a-z0-9-]{1,70}) ===", line)
        if not match:
            match = re.search(r'--only ["\\]?([a-z0-9-]{1,70})(?:[ "\r]|$)', line)
        if match:
            phase = match.group(1)
            status, error = "running", None
            completed = total = None
        match = re.match(r"\[(\d+)/(\d+)\]", line)
        if match:
            completed, total = map(int, match.groups())
            status = "running"
        match = re.search(r"Sentences wanted (\d+): generated (\d+), already done (\d+)", line)
        if match:
            total, generated, reused = map(int, match.groups())
            completed = generated + reused
            status = "complete" if completed == total else "partial"
            error = None if status == "complete" else "skipped"
        if re.search(r"Exit status|ELIFECYCLE|Traceback|Error: ", line, re.I) and not line.lstrip().startswith("skipped:"):
            status, error = "failed", "process"
        elif line.lstrip().startswith("skipped:") and status != "failed":
            status, error = "partial", "speech"
    return dict(phase=phase, status=status, completed=min(completed, total) if total and completed is not None else None,
                total=total or None, updatedAt=stamp.isoformat(timespec="milliseconds").replace("+00:00", "Z"), error=error)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", choices=["windows", "oracle"])
    parser.add_argument("log", type=Path, help="Existing log for the Kani workflow")
    parser.add_argument("--site", default="https://sharpstudy.in")
    args = parser.parse_args()
    site = urllib.parse.urlsplit(args.site)
    if site.scheme != "https" or not site.hostname or site.username or site.query or site.fragment or site.path not in ("", "/"):
        parser.error("--site must be an HTTPS origin")
    token = os.environ.get("JOB_REPORT_TOKEN", "")
    if len(token) < 24:
        parser.error("Set the dedicated JOB_REPORT_TOKEN environment variable")
    with args.log.open("rb") as stream:
        info = os.fstat(stream.fileno())
        stream.seek(max(0, info.st_size - 2 * 1024 * 1024))
        tail = stream.read(2 * 1024 * 1024).decode("utf-8", errors="replace")
    stamp = dt.datetime.fromtimestamp(info.st_mtime, dt.timezone.utc)
    data = summarize(tail, stamp)
    request = urllib.request.Request(
        args.site.rstrip("/") + "/api/v1/admin/monitor/jobs/" + args.source,
        data=json.dumps(data).encode(), headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
    )
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    with urllib.request.build_opener(NoRedirect).open(request, timeout=10) as response:
        print(f"Job status accepted ({response.status})")


if __name__ == "__main__":
    main()
