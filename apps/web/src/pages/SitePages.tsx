import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { NotFound } from "../components/bits";

type Kind = "privacy" | "terms" | "about";
const TITLE = { privacy: "privacyTitle", terms: "termsTitle", about: "aboutTitle" } as const;

export function SitePage({ kind }: { kind: Kind }) {
  const s = useSettings();
  if (s.get("feature.sitePages") !== true) return <NotFound />;
  const text = s.name(s.get(`pages.${kind}`) as { en: string; ta?: string });
  const email = s.get("pages.showContact") === true ? String(s.get("pages.contactEmail") ?? "").trim() : "";
  return (
    <article className="paper prose">
      <h1>{ui(TITLE[kind], s.lang)}</h1>
      {text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
      {email && kind !== "about" && <p><b>{ui("contactWord", s.lang)}:</b> <a href={`mailto:${email}`}>{email}</a></p>}
    </article>
  );
}
