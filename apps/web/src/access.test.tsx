import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { SETTINGS, THEME_PRESETS, PANELS, SITE, defaults } from "@studysmart/shared";
import { AccessGuard } from "./components/AccessGate";
import { AdminApp } from "./admin/AdminApp";
import { UI } from "./lib/i18n";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
beforeEach(() => { cleanup(); sessionStorage.clear(); });

describe("the site name comes from one constant", () => {
  it("is SharpStudy on sharpstudy.in and never the old or a forbidden name", () => {
    expect(SITE.name).toBe("SharpStudy");
    expect(SITE.domain).toBe("sharpstudy.in");
    expect(defaults()["site.name"]).toBe(SITE.name);
  });
  it("English and Tamil screen text use it", () => {
    expect(UI.installTitle.en).toBe(`Install ${SITE.name}`);
    expect(UI.installTitle.ta).toContain(SITE.nameTa);
    for (const [k, v] of Object.entries(UI)) for (const t of [v.en, v.ta]) { expect(t, k).not.toMatch(/StudySmart|ஸ்டடிஸ்மார்ட்/i); }
  });
  it("the page shell and the app manifest match it", () => {
    const html = readFileSync(join(__dirname, "../index.html"), "utf8");
    expect(html).toContain(`<title>${SITE.name}`);
    expect(html).toContain(`content="${SITE.name}"`);
    expect(html).toContain(`https://${SITE.domain}/`);
    const man = JSON.parse(readFileSync(join(__dirname, "../public/manifest.webmanifest"), "utf8"));
    expect(man.name).toBe(SITE.name);
    expect(man.short_name).toBe(SITE.name);
    for (const f of [html, JSON.stringify(man)]) expect(f).not.toMatch(/studysmart|vidyapark/i);
  });
});

describe("invite gate inside the app", () => {
  it("shows the app straight away and stays out of the way when the site is public", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ mode: "public", granted: true })));
    render(<AccessGuard><p>the app</p></AccessGuard>);
    expect(screen.getByText("the app")).toBeTruthy();
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("the app")).toBeTruthy();
  });
  it("ignores odd answers (offline or an older server)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    render(<AccessGuard><p>the app</p></AccessGuard>);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("the app")).toBeTruthy();
  });
  it("shows the bilingual code page when not let in, rejects a wrong code, and opens the app after a good one", async () => {
    let good = false;
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/status")) return json({ mode: "invite", granted: false });
      if (url.endsWith("/redeem")) return JSON.parse(String(init?.body)).code === "SHARP-GOOD-CODE" ? ((good = true), json({ ok: true })) : json({ error: { code: "invalid_code" } }, 401);
      return json({}, 404);
    }));
    render(<AccessGuard><p>the app</p></AccessGuard>);
    await screen.findByRole("heading", { name: SITE.name });
    expect(screen.getByText("Enter your invite code")).toBeTruthy();
    expect(screen.getByText("உங்கள் அழைப்புக் குறியீட்டை உள்ளிடுங்கள்")).toBeTruthy();
    expect(screen.queryByText("the app")).toBeNull();
    const input = screen.getByLabelText(/Enter your invite code/);
    fireEvent.change(input, { target: { value: "SHARP-NOPE-NOPE" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await screen.findByRole("alert");
    expect(screen.getByRole("alert").textContent).toMatch(/did not work/);
    fireEvent.change(input, { target: { value: "SHARP-GOOD-CODE" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await screen.findByText("the app");
    expect(good).toBe(true);
  });
});

describe("admin: Site access panel", () => {
  it("lists codes, makes one with the chosen limits and cancels one", async () => {
    let codes = [{ id: "11111111-1111-1111-1111-111111111111", code: "SHARP-AAAA-BBBB", label: "Class 3", maxUses: 5, uses: 2, expiresAt: null, revokedAt: null, createdAt: new Date().toISOString(), status: "active" }];
    let created: unknown = null; let revoked = "";
    vi.stubGlobal("confirm", () => true);
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/session")) return json({ ok: true });
      if (url.endsWith("/access/codes") && init?.method === "POST") { created = JSON.parse(String(init.body)); return json({ code: { ...codes[0]!, id: "2", code: "SHARP-CCCC-DDDD" } }, 201); }
      if (url.endsWith("/access/codes")) return json({ codes });
      if (url.endsWith("/revoke")) { revoked = url; codes = codes.map((c) => ({ ...c, status: "revoked" })); return json({ ok: true }); }
      if (url.endsWith("/settings")) return json({ panels: PANELS, definitions: SETTINGS, presets: THEME_PRESETS, values: defaults(), overridden: [] });
      return json({}, 404);
    }));
    sessionStorage.setItem("ss_admin_key", "k");
    render(<AdminApp />);
    fireEvent.click(await screen.findByRole("button", { name: "Site access" }));
    expect(await screen.findByText("SHARP-AAAA-BBBB")).toBeTruthy();
    expect(screen.getByText("2 of 5")).toBeTruthy();
    expect(screen.getByText("Who can open the site")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/How many people can use it/), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/Stops working after/), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/Note to yourself/), { target: { value: "Friends" } });
    fireEvent.click(screen.getByRole("button", { name: "Make a new code" }));
    await waitFor(() => expect(created).toEqual({ label: "Friends", maxUses: 3, expiresInDays: 7 }));
    await screen.findByText(/New code: SHARP-CCCC-DDDD/);
    fireEvent.click(screen.getByRole("button", { name: "Cancel code" }));
    await waitFor(() => expect(revoked).toContain("/revoke"));
    await screen.findByText("Cancelled");
  });
});
