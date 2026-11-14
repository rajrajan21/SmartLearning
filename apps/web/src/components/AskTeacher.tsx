import { useState, type FormEvent } from "react";
import { AskResponse } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { anonId } from "../lib/practice";

type Mode = "explain" | "example" | "hint" | "free";
interface Turn { role: "child" | "teacher"; text: string; source?: "ai" | "lesson" | "safety" }

/** "Ask Malar Teacher": questions about this lesson or practice question. Answers come from the lesson; AI answers are labelled. */
export function AskTeacher({ topicId, questionId, about, afterAnswer }: { topicId?: string; questionId?: string; about: string; afterAnswer?: boolean }) {
  const s = useSettings();
  const { lang } = s;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const max = s.get<number>("tutor.maxQuestionChars");
  const voice = s.get("narration.browserVoice") === true && typeof window !== "undefined" && "speechSynthesis" in window;

  const send = async (question: string, mode: Mode) => {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true); setErr("");
    const history = turns.slice(-4).map((t) => ({ role: t.role, text: t.text.slice(0, 800) }));
    try {
      const r = await fetch("/api/v1/tutor/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topicId, questionId, anonId: anonId(), question: q, mode, lang, history }) });
      if (!r.ok) {
        const m = (await r.json().catch(() => null))?.error?.message as string | undefined;
        setErr(r.status === 401 ? ui("askSignIn", lang) : r.status === 429 ? ui("askWait", lang) : m ?? ui("askError", lang));
        return;
      }
      const a = AskResponse.parse(await r.json());
      setTurns((t) => [...t, { role: "child", text: q }, { role: "teacher", text: a.answer, source: a.source }]);
      setLeft(a.remaining); setText("");
    } catch { setErr(ui("askError", lang)); } finally { setBusy(false); }
  };
  const speak = (t: string) => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = lang === "ta" ? "ta-IN" : "en-IN"; speechSynthesis.speak(u); };
  const submit = (e: FormEvent) => { e.preventDefault(); void send(text, afterAnswer ? "explain" : "free"); };

  if (!open) return <p className="ask-open"><button type="button" className="btn ghost sm" onClick={() => setOpen(true)}>💬 {ui("askTeacher", lang)}</button></p>;
  return (
    <section className="ask" aria-label={ui("askTeacher", lang)}>
      <div className="ask-head"><b>{s.text("tutor.greeting")}</b><button type="button" className="link" onClick={() => setOpen(false)}>{ui("close", lang)}</button></div>
      <ul className="ask-log" aria-live="polite">
        {turns.map((t, i) => (
          <li key={i} className={t.role === "child" ? "me" : "teacher"}>
            <p>{t.text}</p>
            {t.role === "teacher" && (
              <p className="small">
                {t.source === "ai" && s.get("tutor.showAiNote") === true && <span>{ui("aiNote", lang)} </span>}
                {voice && <button type="button" className="link" onClick={() => speak(t.text)}>🔊 {ui("listenAnswer", lang)}</button>}
              </p>
            )}
          </li>
        ))}
        {busy && <li className="teacher" role="status"><p>…</p></li>}
      </ul>
      <div className="chips-row">
        <button type="button" className="btn ghost sm" disabled={busy} onClick={() => void send(text || about, "explain")}>{ui("explainAgain", lang)}</button>
        <button type="button" className="btn ghost sm" disabled={busy} onClick={() => void send(text || about, "example")}>{ui("giveExample", lang)}</button>
      </div>
      <form className="ask-form" onSubmit={submit}>
        <label htmlFor={`ask-${questionId ?? topicId}`} className="sr">{ui("askPlaceholder", lang)}</label>
        <input id={`ask-${questionId ?? topicId}`} value={text} maxLength={max} placeholder={ui("askPlaceholder", lang)} autoComplete="off" onChange={(e) => setText(e.target.value)} />
        <button className="btn" disabled={busy || !text.trim()}>{ui("askButton", lang)}</button>
      </form>
      {left !== null && <p className="small">{ui("askLeft", lang)}: {left}</p>}
      {err && <p className="err" role="alert">{err}</p>}
    </section>
  );
}
