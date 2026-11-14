import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const id1 = "00000000-0000-4000-8000-000000000001", id2 = "00000000-0000-4000-8000-000000000002";
const kids = [{ id: id1, nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" }, { id: id2, nickname: "Arun", classLevel: 3, avatar: "lion", language: "en" }];
const meWith = (active: string | null) => ({ user: { id: "u1", email: "mum@example.com" }, profiles: kids, activeProfileId: active });

let signedIn: string | null | false = false; // false = signed out, otherwise active profile id (or null = nobody chosen)
let serverSync: unknown = { lesson: {}, practice: {} };
const calls: { method: string; url: string; body?: unknown }[] = [];

function mount(path: string, settings: Record<string, unknown> = {}) {
  calls.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET", body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const ok = (b: unknown, status = 200) => new Response(b === null ? "null" : JSON.stringify(b), { status });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (!url.includes("/account/")) return new Response("{}", { status: 404 });
    calls.push({ method, url, body });
    if (url.endsWith("/me")) return ok(signedIn === false ? null : meWith(signedIn));
    if (url.endsWith("/login")) { if (body.password !== "right-password") return ok({ error: { message: "Email or password is not right." } }, 401); signedIn = id1; return ok(meWith(id1)); }
    if (url.endsWith("/register")) { signedIn = id1; return ok(meWith(id1), 201); }
    if (url.endsWith("/logout")) { signedIn = false; return new Response(null, { status: 204 }); }
    if (url.includes("/select")) { signedIn = url.includes(id2) ? id2 : id1; return ok(meWith(signedIn)); }
    if (url.endsWith("/sync") && method === "GET") return ok(serverSync);
    if (url.endsWith("/sync") && method === "PUT") return ok(body);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); signedIn = false; serverSync = { lesson: {}, practice: {} }; });

describe("accounts", () => {
  it("shows the sign-in form to a signed-out visitor and signs in", async () => {
    mount("/account");
    fireEvent.change(await screen.findByLabelText("Parent's email"), { target: { value: "mum@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" }).at(-1)!);
    await screen.findByText("Email or password is not right.");
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "right-password" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" }).at(-1)!);
    await screen.findByText("Who is learning?");
    expect(screen.getByText("Riya", { selector: ".kid-info b" })).toBeTruthy();
  });

  it("creating an account needs the parent's agreement and a nickname", async () => {
    mount("/account");
    fireEvent.click(await screen.findByRole("tab", { name: "Create a parent account" }));
    fireEvent.change(screen.getByLabelText("Parent's email"), { target: { value: "mum@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "long-enough-pw" } });
    fireEvent.change(screen.getByLabelText("Child's nickname"), { target: { value: "Riya" } });
    const submit = screen.getAllByRole("button", { name: "Create a parent account" }).at(-1) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);
    await screen.findByText("Who is learning?");
    const reg = calls.find((c) => c.url.endsWith("/register"))!;
    expect(reg.body).toMatchObject({ email: "mum@example.com", consent: true, child: { nickname: "Riya", classLevel: 3 } });
  });

  it("pulls the child's saved progress onto this device and saves local progress back", async () => {
    signedIn = id1;
    serverSync = { lesson: { t9: { step: 3, total: 5, done: false, updatedAt: 500 } }, practice: {} };
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 1, total: 2, done: true, updatedAt: 100 } }));
    mount("/account");
    await screen.findByText("Who is learning?");
    await waitFor(() => expect(JSON.parse(localStorage.getItem("ss_progress_v1")!).t9.step).toBe(3));
    expect(JSON.parse(localStorage.getItem("ss_progress_v1")!).t1.done).toBe(true); // first sign-in adopts what was done as a guest
    await waitFor(() => expect(calls.some((c) => c.method === "PUT" && c.url.endsWith("/sync"))).toBe(true));
    await screen.findByText("Progress saved to your account.");
  });

  it("never mixes one child's progress into another's", async () => {
    signedIn = id2;
    localStorage.setItem("ss_sync_owner", id1);
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 1, total: 2, done: true, updatedAt: 100 } }));
    serverSync = { lesson: {}, practice: {} };
    mount("/account");
    await screen.findByText("Who is learning?");
    await waitFor(() => expect(JSON.parse(localStorage.getItem("ss_progress_v1")!)).toEqual({}));
  });

  it("signing out clears this device's progress", async () => {
    signedIn = id1;
    mount("/account");
    fireEvent.click(await screen.findByRole("button", { name: "Sign out" }));
    await screen.findByRole("tab", { name: "Sign in" });
    expect(JSON.parse(localStorage.getItem("ss_progress_v1") ?? "{}")).toEqual({});
  });

  it("header shows the learner, and everything disappears when accounts are switched off", async () => {
    signedIn = id1;
    mount("/");
    await screen.findByText("Riya", { selector: ".acct-link" });
    cleanup();
    mount("/account", { "feature.accounts": false });
    await screen.findByText(/could not find that page/i);
    expect(screen.queryByRole("link", { name: /sign in/i })).toBeNull();
  });
});
