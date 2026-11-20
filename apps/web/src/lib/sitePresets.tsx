import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./settings";

export const presets = [
  {
    "id": "classic",
    "name": "Classic",
    "description": "The current SharpStudy design"
  },
  {
    "id": "classroom",
    "name": "Classroom",
    "description": "Teaching board, class tiles and a daily activity rail"
  },
  {
    "id": "path",
    "name": "Study Path",
    "description": "Learning roadmap, chapter stops and a folded activity tray"
  },
  {
    "id": "explorer",
    "name": "Subject Explorer",
    "description": "Class and chapter grids with browse-first navigation"
  },
  {
    "id": "dashboard",
    "name": "Student Dashboard",
    "description": "Navigation sidebar, progress cards and daily activities"
  },
  {
    "id": "activity",
    "name": "Activity Hub",
    "description": "Daily GK, puzzles and challenge alongside course shortcuts"
  },
  {
    "id": "reading",
    "name": "Reading Room",
    "description": "A focused reading column, compact menu and folded activities"
  }
] as const;
export type Preset = typeof presets[number]["id"];
export const presetKey = "layout.sitePreset";
const valid = (value: unknown): value is Preset => presets.some(({ id }) => id === value);
export const PresetContext = createContext<Preset>("classic");
export const usePreset = () => useContext(PresetContext);
export function previewFrame(): Preset | null {
  if (typeof window === "undefined") return null;
  try {
    const id = (window.frameElement as HTMLElement | null)?.dataset.sharpstudyPreview;
    return window.parent.location.pathname === "/admin" && valid(id) ? id : null;
  } catch { return null; }
}
export function useSitePreset(): Preset {
  const stored = useSettings().get<string>(presetKey);
  const [preview, setPreview] = useState<Preset | null>(null);
  useEffect(() => {
    const id = previewFrame();
    if (!id) return;
    let active = true;
    void import("../admin/api").then(({ admin }) => admin.session()).then(() => {
      if (active) setPreview(id);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return preview ?? (valid(stored) ? stored : "classic");
}
