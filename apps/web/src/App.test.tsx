import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

afterEach(() => vi.restoreAllMocks());

describe("App", () => {
  it("shows tagline and loads boards", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ boards: [{ boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27" }] }),
    }));
    render(<App />);
    expect(screen.getByText(/Understand every chapter/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/CBSE \(2026-27\)/)).toBeTruthy());
  });
});
