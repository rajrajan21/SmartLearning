import { useEffect, useMemo, useState } from "react";
import { useSettings } from "./settings";
import { store } from "./storage";

export interface BoardInfo { code: string; name: string; lessons: number; topics: number; classes: { classLevel: number; lessons: number }[] }
export interface BoardOption { code: string; label: string; lessons: number; classes: { classLevel: number; lessons: number }[] }

/** The boards the site knows by name; any other board loaded later is listed with the name it was loaded with. */
export const KNOWN_BOARDS = ["CBSE", "TNMATRIC", "TNSTATE"] as const;
const ENGLISH: Record<string, string> = { CBSE: "CBSE", TNMATRIC: "Tamil Nadu Matriculation", TNSTATE: "Tamil Nadu State Board" };
export const boardLabelFor = (code: string) => ENGLISH[code.toUpperCase()] ?? code.toUpperCase();

let cache: BoardInfo[] | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const SAVED = "ss_board_summary";

function load(): void {
  if (inflight) return;
  inflight = fetch("/api/v1/lessons/board-summary")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: { boards?: BoardInfo[] }) => { if (Array.isArray(d.boards)) { cache = d.boards; store.setJson(SAVED, d.boards); } })
    .catch(() => { if (!cache) cache = store.getJson<BoardInfo[]>(SAVED); })
    .finally(() => { inflight = null; listeners.forEach((l) => l()); });
}

/** Boards that have lessons, from the server (kept for offline use). null while loading and when nothing could be read. */
export function useBoardInfo(): BoardInfo[] | null {
  const [, tick] = useState(0);
  useEffect(() => {
    const l = () => tick((n) => n + 1);
    listeners.add(l);
    if (!cache) { cache = store.getJson<BoardInfo[]>(SAVED); }
    load();
    return () => { listeners.delete(l); };
  }, []);
  return cache;
}

/** Pure: which boards to offer, in order. Kept free of React so it can be tested. */
export function chooseBoards(o: {
  info: BoardInfo[] | null;
  get: (key: string) => unknown;
  text: (key: string) => string;
}): { ready: BoardOption[]; soon: BoardOption[] } {
  const def = String(o.get("catalog.defaultBoard") || "CBSE").toUpperCase();
  const label = (code: string, apiName?: string) => {
    const c = code.toUpperCase();
    return (KNOWN_BOARDS as readonly string[]).includes(c) ? (o.text(`catalog.board.${c.toLowerCase()}.label`) || boardLabelFor(c)) : (apiName || c);
  };
  const only = (): { ready: BoardOption[]; soon: BoardOption[] } => {
    const b = o.info?.find((x) => x.code.toUpperCase() === def);
    return { ready: [{ code: def, label: label(def, b?.name), lessons: b?.lessons ?? 0, classes: b?.classes ?? [] }], soon: [] };
  };
  if (o.get("catalog.boards.showAll") === false || !o.info) return only();
  const hideEmpty = o.get("catalog.boards.hideEmpty") !== false;
  const others = o.get("catalog.boards.showOthers") !== false;
  const codes = new Set<string>([...KNOWN_BOARDS, ...o.info.map((b) => b.code.toUpperCase())]);
  const ready: BoardOption[] = [], soon: BoardOption[] = [];
  for (const code of codes) {
    const known = (KNOWN_BOARDS as readonly string[]).includes(code);
    if (known ? o.get(`catalog.board.${code.toLowerCase()}.show`) === false : !others) continue;
    const b = o.info.find((x) => x.code.toUpperCase() === code);
    const opt: BoardOption = { code, label: label(code, b?.name), lessons: b?.lessons ?? 0, classes: b?.classes ?? [] };
    if (b && (opt.lessons > 0 || !hideEmpty)) ready.push(opt);
    else if (known && o.get("catalog.showComingSoon") !== false) soon.push(opt);
  }
  const order = String(o.get("catalog.boards.order") ?? "").toUpperCase().split(/[\s,]+/).filter(Boolean);
  const rank = (c: string) => { const i = order.indexOf(c); return i < 0 ? 1000 + (KNOWN_BOARDS as readonly string[]).indexOf(c) + (c === def ? -500 : 0) : i; };
  const byOrder = (a: BoardOption, b: BoardOption) => rank(a.code) - rank(b.code) || a.code.localeCompare(b.code);
  ready.sort(byOrder); soon.sort(byOrder);
  if (ready.length === 0) return only();
  return { ready, soon };
}

export function useVisibleBoards(): { ready: BoardOption[]; soon: BoardOption[]; loaded: boolean } {
  const s = useSettings();
  const info = useBoardInfo();
  return useMemo(() => ({ ...chooseBoards({ info, get: (k) => s.get(k as never), text: (k) => s.text(k) }), loaded: info !== null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [info, s.values, s.lang]);
}

// The board a student chose on this device.
const CHOSEN = "ss_board_choice";
const chosenListeners = new Set<() => void>();
export const getChosenBoard = (): string | null => { const v = store.get(CHOSEN); return v ? v.toUpperCase() : null; };
export function setChosenBoard(code: string): void { store.set(CHOSEN, code.toUpperCase()); chosenListeners.forEach((l) => l()); }
export function useChosenBoard(): string | null {
  const [v, set] = useState(getChosenBoard);
  useEffect(() => { const l = () => set(getChosenBoard()); chosenListeners.add(l); return () => { chosenListeners.delete(l); }; }, []);
  return v;
}

/** The board named in the address, when it is one of the boards on offer: /tnmatric/10/..., /classroom/tnmatric/..., /play/mode/tnmatric/... */
export function boardFromPath(path: string, codes: string[]): string | null {
  const p = path.split("/").filter(Boolean);
  const at = ["classroom", "exam", "worksheet", "path", "term"].includes(p[0] ?? "") ? 1 : p[0] === "play" ? 2 : 0;
  const c = (p[at] ?? "").toUpperCase();
  return c && codes.includes(c) ? c : null;
}
