import { useLocation } from "wouter";
import { useSettings } from "./settings";
import { useAccountOptional } from "./account";
import { boardFromPath, useChosenBoard, useVisibleBoards } from "./boards";

export const BOARD_LABEL: Record<string, string> = { CBSE: "CBSE", TNSTATE: "Tamil Nadu State Board", TNMATRIC: "Tamil Nadu Matriculation" };

/** The board whose lessons the site shows now. In order: the board named in the address; the signed-in child's own board when the admin lets parents choose;
 *  the board the student picked on this device (when the admin allows remembering it); the default board. Only boards the admin offers are used. */
export function useActiveBoard(): string {
  const s = useSettings();
  const acct = useAccountOptional();
  const [loc] = useLocation();
  const chosen = useChosenBoard();
  const { ready } = useVisibleBoards();
  const codes = ready.map((b) => b.code);
  const def = String(s.get<string>("catalog.defaultBoard") || "CBSE").toUpperCase();
  const fromUrl = boardFromPath(loc, codes);
  if (fromUrl) return fromUrl;
  const on: Record<string, boolean> = { CBSE: s.get("accounts.child.board.cbse") !== false, TNSTATE: s.get("accounts.child.board.tnstate") === true, TNMATRIC: s.get("accounts.child.board.tnmatric") === true };
  const own = acct?.active?.boardCode;
  if (s.get("accounts.child.chooseBoard") === true && own && on[own]) return own;
  if (s.get("catalog.boards.remember") !== false && chosen && codes.includes(chosen)) return chosen;
  return codes.includes(def) ? def : (codes[0] ?? def);
}
