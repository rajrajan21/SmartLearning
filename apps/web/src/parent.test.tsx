import { dayNumber } from "@studysmart/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const id1 = "00000000-0000-4000-8000-000000000001";
const day = dayNumber(); // local calendar day, same as the app
const me = { user: { id: "u1", email: "mum@example.com" }, profiles: [{ id: id1, nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" }], activeProfileId: id1 };
const report = (over: Record<string, unknown> = {}) => ({
  children: [{
    profile: me.profiles[0], progress: { lesson: {}, practice: {}, revision: {} },
    activeDays: [day, day - 1, day - 2], daily: { [day]: { n: 6, right: 5 }, [day - 1]: { n: 4, right: 4 } },
    attempts: 10, correct: 9, weak: [{ questionId: "q-1", wrong: 3, total: 4 }], ...over,
  }],
});
let signedIn = true, dash: unknown = report();

function mount(settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.endsWith("/account/me")) return ok(signedIn ? me : null);
    if (url.includes("/account/dashboard")) return ok(dash);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path: "/parent", static: false });
  return render(<Router hook={hook}><SettingsProvider><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); signedIn = true; dash = report(); });

describe("parent dashboard", () => {
  it("shows the weekly goal, answers and accuracy for the child", async () => {
    mount();
    await screen.findByText(/learned on 3 of the last 7 days/);
    expect(screen.getByText("90%")).toBeTruthy();
    expect(screen.getByText("Weekly goal: 3 / 4")).toBeTruthy();
  });

  it("asks a signed-out visitor to sign in", async () => {
    signedIn = false;
    mount();
    await screen.findByText("Sign in as a parent to see your child's progress.");
  });

  it("hides accuracy and the activity chart when the admin switches them off", async () => {
    mount({ "parent.showAccuracy": false, "parent.showActivity": false });
    await screen.findByText(/learned on 3 of the last 7 days/);
    expect(screen.queryByText("90%")).toBeNull();
    expect(screen.queryByText("Answers in the last 14 days")).toBeNull();
  });

  it("is not available when the feature is off", async () => {
    mount({ "feature.parentDashboard": false });
    await screen.findByText("We could not find that page.");
  });

  it("explains an empty report", async () => {
    dash = report({ activeDays: [], daily: {}, attempts: 0, correct: 0, weak: [] });
    mount();
    await screen.findByText(/No activity yet/);
  });
});
