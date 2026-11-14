import { type ReactNode } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui, otherName, type Named } from "../lib/i18n";

export function Loading() {
  const { lang } = useSettings();
  return <p className="loading" role="status">{ui("loading", lang)}…</p>;
}
export function ErrorBox({ onRetry }: { onRetry: () => void }) {
  const { lang } = useSettings();
  return (
    <div className="notice" role="alert">
      <p>{ui("loadError", lang)}</p>
      <button type="button" className="btn" onClick={onRetry}>{ui("retry", lang)}</button>
    </div>
  );
}
export function NotFound() {
  const { lang } = useSettings();
  return (
    <div className="notice">
      <h1>404</h1>
      <p>{ui("notFound", lang)}</p>
      <Link className="btn" href="/">{ui("backHome", lang)}</Link>
    </div>
  );
}
export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  const s = useSettings();
  if (!s.get("feature.breadcrumbs")) return null;
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>{it.href && i < items.length - 1 ? <Link href={it.href}>{it.label}</Link> : <span aria-current={i === items.length - 1 ? "page" : undefined}>{it.label}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}
/** Title in the current language, with the other language underneath when the admin turned that on. */
export function Title({ name, as: As = "span" }: { name: Named; as?: "span" | "h1" | "h2" | "h3" }) {
  const s = useSettings();
  const other = s.get("lang.showBothTitles") && s.get("lang.tamil.enabled") ? otherName(name, s.lang) : null;
  return (
    <>
      <As>{s.name(name)}</As>
      {other && <small className="alt" lang={s.lang === "en" ? "ta" : "en"}>{other}</small>}
    </>
  );
}
export function Page({ children }: { children: ReactNode }) { return <div className="paper">{children}</div>; }
