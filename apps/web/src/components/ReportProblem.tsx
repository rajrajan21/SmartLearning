import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

/** A small "Report a problem" form. Sends no name or e-mail, only the note and what it is about. */
export function ReportProblem({ kind, about, where }: { kind: "question" | "lesson" | "page" | "other"; about: string; where: "onQuestions" | "onLessons" }) {
  const s = useSettings();
  const { lang } = s;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  if (s.get("reports.enabled") !== true || s.get(`reports.${where}`) !== true) return null;
  const send = async () => {
    setState("sending");
    try {
      const r = await fetch("/api/v1/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, about: about.slice(0, 200), text: text.trim() }) });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  };
  if (state === "done") return <p className="small report-done" role="status">{ui("reportThanks", lang)}</p>;
  if (!open) return <p className="report-line"><button type="button" className="link small" onClick={() => setOpen(true)}>⚑ {ui("reportProblem", lang)}</button></p>;
  return (
    <form className="report-form" onSubmit={(e) => { e.preventDefault(); if (text.trim().length >= 3) void send(); }}>
      <label htmlFor="rp-text">{ui("reportWhat", lang)}</label>
      <textarea id="rp-text" rows={3} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="q-actions">
        <button type="submit" className="btn sm" disabled={state === "sending" || text.trim().length < 3}>{ui("reportSend", lang)}</button>
        <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>{ui("reportCancel", lang)}</button>
      </div>
      {state === "error" && <p className="err" role="alert">{ui("reportFailed", lang)}</p>}
    </form>
  );
}
