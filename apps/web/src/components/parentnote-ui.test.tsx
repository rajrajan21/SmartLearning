import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsProvider } from "../lib/settings";
import { ParentNote } from "./ParentNote";

describe("ParentNote close button", () => {
  it("shows the note and hides it when closed", () => {
    localStorage.clear();
    render(<SettingsProvider><ParentNote /></SettingsProvider>);
    expect(screen.getByRole("note")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("note")).toBeNull();
  });
});
