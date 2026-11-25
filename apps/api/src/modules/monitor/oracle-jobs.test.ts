import { describe, expect, it } from "vitest";
import { classifyOracleJob, collectDescendantComms } from "./oracle-jobs.js";

describe("classifyOracleJob (OPS-02)", () => {
  const now = "2026-11-25T05:30:00.000Z";
  const start = "Wed 2026-11-25 05:20:00 UTC";

  it("classifies an active audio service blocked on flock as waiting, not running", () => {
    const job = classifyOracleJob(
      { Id: "sharpstudy-quiet-voices.service", ActiveState: "active", SubState: "running", ExecMainStartTimestamp: start },
      null,
      now,
      ["flock"],
    );
    expect(job?.status).toBe("waiting");
    expect(job?.phase).toBe("Waiting on shared audio lock");
    expect(job?.elapsedSeconds).toBe(600);
  });

  it("classifies an active audio service with a node/python worker as running with Recording audio phase", () => {
    const job = classifyOracleJob(
      { Id: "sharpstudy-quiet-voices.service", ActiveState: "active", SubState: "running", ExecMainStartTimestamp: start },
      null,
      now,
      ["sudo", "node", "python3"],
    );
    expect(job?.status).toBe("running");
    expect(job?.phase).toBe("Recording audio");
  });

  it("classifies a service with StatusText indicating lock/waiting as waiting", () => {
    const job = classifyOracleJob(
      { Id: "sharpstudy-kani-batch.service", ActiveState: "active", SubState: "running", StatusText: "Waiting for audio lock", ExecMainStartTimestamp: start },
      null,
      now,
      ["bash"],
    );
    expect(job?.status).toBe("waiting");
    expect(job?.phase).toBe("Waiting on shared audio lock");
  });

  it("collects multi-hop descendants so bash -> sudo -> node classifies as Recording audio", () => {
    const psOut = [
      "  100     1 systemd",
      "349968    1 bash",
      "350220 349968 sudo",
      "350221 350220 node",
      "370267 350221 python3",
    ].join("\n");
    const comms = collectDescendantComms(psOut, 349968);
    expect(comms).toEqual(["sudo", "node", "python3"]);
    const job = classifyOracleJob(
      { Id: "sharpstudy-quiet-voices.service", ActiveState: "active", SubState: "running", ExecMainStartTimestamp: start },
      null,
      now,
      comms,
    );
    expect(job?.status).toBe("running");
    expect(job?.phase).toBe("Recording audio");
  });
});
