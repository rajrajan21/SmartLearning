import { useEffect } from "react";
import { pageTitle } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { NotFound } from "../components/bits";

type Kind = "privacy" | "terms" | "about";
const TITLE = { privacy: "privacyTitle", terms: "termsTitle", about: "aboutTitle" } as const;

export function SitePage({ kind }: { kind: Kind }) {
  const s = useSettings();
  const on = s.get("feature.sitePages") === true;
  const heading = ui(TITLE[kind], s.lang);
  useEffect(() => {
    if (!on) return;
    const before = document.title;
    document.title = pageTitle(heading); // search results show "About – SharpStudy"
    return () => { document.title = before; };
  }, [on, heading]);
  if (!on) return <NotFound />;
  const text = s.name(s.get(`pages.${kind}`) as { en: string; ta?: string });
  const email = s.get("pages.showContact") === true ? String(s.get("pages.contactEmail") ?? "").trim() : "";
  return (
    <article className="paper prose">
      <h1>{heading}</h1>
      {text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
      {email && kind !== "about" && <p><b>{ui("contactWord", s.lang)}:</b> <a href={`mailto:${email}`}>{email}</a></p>}
    </article>
  );
}
