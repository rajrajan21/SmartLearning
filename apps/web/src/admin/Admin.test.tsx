import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { SETTINGS, THEME_PRESETS, PANELS, defaults } from "@studysmart/shared";
import { AdminApp } from "./AdminApp";

let saved: Record<string, unknown> | null = null;
beforeEach(() => {
  cleanup(); sessionStorage.clear(); saved = null;
  vi.stubGlobal("confirm", () => true);
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const key = (init?.headers as Record<string, string> | undefined)?.["x-admin-key"];
    if (key !== "good-key") return new Response(JSON.stringify({ error: { message: "no" } }), { status: 401 });
    if (url.endsWith("/session")) return new Response("{}", { status: 200 });
    if (url.endsWith("/settings") && init?.method === "PUT") { saved = JSON.parse(String(init.body)).changes; return new Response(JSON.stringify({ values: { ...defaults(), ...saved }, overridden: Object.keys(saved!) }), { status: 200 }); }
    if (url.endsWith("/settings")) return new Response(JSON.stringify({ panels: PANELS, definitions: SETTINGS, presets: THEME_PRESETS, values: defaults(), overridden: [] }), { status: 200 });
    return new Response("{}", { status: 404 });
  }));
});

describe("admin console", () => {
  it("rejects a wrong key and accepts the right one", async () => {
    render(<AdminApp />);
    fireEvent.change(screen.getByLabelText("Admin key"), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/not correct/));
    fireEvent.change(screen.getByLabelText("Admin key"), { target: { value: "good-key" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Features" })).toBeTruthy());
  });
  it("toggles a feature and saves only the change; planned features are locked", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    const sw = await screen.findByRole("switch", { name: /Search/i, checked: true });
    fireEvent.click(sw);
    expect(screen.getByText(/1 unsaved change/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(saved).toEqual({ "feature.search": false }));
    const planned = screen.getAllByRole("switch").filter((e) => (e as HTMLButtonElement).disabled);
    expect(planned.length).toBeGreaterThan(5);
  });
  it("applies a style preset to the draft and warns about low contrast", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    fireEvent.click(await screen.findByRole("button", { name: "Look and feel" }));
    fireEvent.click(screen.getByRole("button", { name: /Sunrise/ }));
    expect(screen.getByText(/unsaved change/)).toBeTruthy();
    const hex = screen.getByLabelText("Text hex code") as HTMLInputElement;
    fireEvent.change(hex, { target: { value: "#F5F5F5" } });
    await waitFor(() => expect(screen.getAllByText(/Hard to read/).length).toBeGreaterThan(0));
  });
});
