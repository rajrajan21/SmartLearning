import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { SETTINGS, THEME_PRESETS, THEMES, PALETTES, PANELS, defaults } from "@studysmart/shared";
import { AdminApp } from "./AdminApp";

let saved: Record<string, unknown> | null = null;
beforeEach(() => {
  cleanup(); sessionStorage.clear(); saved = null;
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal("confirm", () => true);
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const h = init?.headers as Record<string, string> | undefined;
    const key = h?.["x-admin-key"];
    const user = decodeURIComponent(h?.["x-admin-user"] ?? "");
    if (key !== "good-key" || (user !== "" && user.toLowerCase() !== "itsme.rajrajan@gmail.com")) return new Response(JSON.stringify({ error: { message: "no" } }), { status: 401 });
    if (url.endsWith("/monitor/jobs")) return new Response(JSON.stringify({ oracle: null, windows: null }), { status: 200 });
    if (url.endsWith("/session")) return new Response("{}", { status: 200 });
    if (url.endsWith("/settings") && init?.method === "PUT") { saved = JSON.parse(String(init.body)).changes; return new Response(JSON.stringify({ values: { ...defaults(), ...saved }, overridden: Object.keys(saved!) }), { status: 200 }); }
    if (url.endsWith("/settings")) return new Response(JSON.stringify({ panels: PANELS, definitions: SETTINGS, presets: THEME_PRESETS, values: defaults(), overridden: [] }), { status: 200 });
    return new Response("{}", { status: 404 });
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("admin console", () => {
  it("finds a setting from any section by a search word, and clears back", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Overview" })).toBeTruthy());
    fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "journey road" } });
    expect(screen.getByRole("heading", { name: "Search results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Journey road above the chapter list/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "zzzqqq" } });
    expect(screen.getByText("0 results")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("heading", { name: "Overview" })).toBeTruthy();
  });
  it("rejects a wrong key and accepts the right one", async () => {
    render(<AdminApp />);
    expect((screen.getByLabelText("User id") as HTMLInputElement).value).toBe("itsme.rajrajan@gmail.com"); // pre-filled
    fireEvent.change(screen.getByLabelText("Admin key"), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/not correct/));
    fireEvent.change(screen.getByLabelText("User id"), { target: { value: "someone@else.com" } });
    fireEvent.change(screen.getByLabelText("Admin key"), { target: { value: "good-key" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/user id or key is not correct/));
    fireEvent.change(screen.getByLabelText("User id"), { target: { value: "ItsMe.RajRajan@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Admin key"), { target: { value: "good-key" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Overview" })).toBeTruthy());
  });
  it("toggles a feature and saves only the change; planned features are locked", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    fireEvent.click(await screen.findByText("Site settings"));
    fireEvent.click(await screen.findByRole("button", { name: "Features" }));
    const sw = await screen.findByRole("switch", { name: /^Search$/i, checked: true });
    fireEvent.click(sw);
    expect(screen.getByText(/1 unsaved change/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(saved).toEqual({ "feature.search": false }));
    const planned = screen.getAllByRole("switch").filter((e) => (e as HTMLButtonElement).disabled);
    expect(planned.length).toBeGreaterThanOrEqual(1);
  });
  it("applies a style preset to the draft and warns about low contrast", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    fireEvent.click(await screen.findByText("Site settings"));
    fireEvent.click(screen.getByRole("button", { name: "Look and feel" }));
    fireEvent.click(screen.getByRole("button", { name: /Sunrise/ }));
    expect(screen.getByText(/unsaved change/)).toBeTruthy();
    const hex = screen.getByLabelText("Text hex code") as HTMLInputElement;
    fireEvent.change(hex, { target: { value: "#F5F5F5" } });
    expect(screen.getAllByText(/Hard to read/).length).toBeGreaterThan(0);
  }, 15_000);
});

describe("look and feel panel", () => {
  it("shows theme and palette selects with previews, labels the recommended default and resets to it", async () => {
    sessionStorage.setItem("ss_admin_key", "good-key");
    render(<AdminApp />);
    fireEvent.click(await screen.findByText("Site settings"));
    fireEvent.click(screen.getByRole("button", { name: "Look and feel" }));
    expect(screen.getByRole("radiogroup", { name: "Theme" }).querySelectorAll("[role=radio]").length).toBe(THEMES.length);
    expect(screen.getByRole("radiogroup", { name: "Colour palette" }).querySelectorAll("[role=radio]").length).toBe(PALETTES.length + 1);
    expect(screen.getAllByText("Recommended").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Theme (page style)")).toBeTruthy();
    expect(screen.getByLabelText("Colour palette", { selector: "select" })).toBeTruthy();
    const reset = screen.getByRole("button", { name: "Reset to recommended" }) as HTMLButtonElement;
    expect(reset.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: /Aurora Glass/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Mint Fresh/ }));
    expect(screen.getByText(/2 unsaved changes/)).toBeTruthy();
    expect(screen.queryByLabelText("Text hex code")).toBeNull(); // custom colour pickers hidden unless palette is Custom
    expect(reset.disabled).toBe(false);
    fireEvent.click(reset);
    await waitFor(() => expect(screen.getByText(/All changes saved/)).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /^Custom/ }));
    expect(screen.getByLabelText("Text hex code")).toBeTruthy();
  }, 15_000);
});
