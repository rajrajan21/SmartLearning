import { useState } from "react";
import { presets, type Preset } from "../lib/sitePresets";
import { sample } from "../lib/sampleLesson";
import { admin } from "./api";

const pages = [
  { name: "Home", href: "/" },
  { name: "Subject", href: "/cbse/6/maths" },
  { name: "Lesson", href: sample.href },
];
export function LayoutGallery({ active, selection, setSelection, save, busy }: {
  active: unknown; selection: Preset; setSelection: (value: Preset) => void; save: (value: Preset) => void; busy: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const [page, setPage] = useState(pages[0]!.href);
  const [mobile, setMobile] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const selected = presets.find(({ id }) => id === selection)!;
  const open = async () => {
    setChecking(true); setError(false);
    try { await admin.session(); setPreview(true); } catch { setError(true); }
    finally { setChecking(false); }
  };
  return <>
    <div className="a-head"><div><h2>Layout gallery</h2><p>Choose a layout, preview the public pages, then save your choice for the whole site.</p></div></div>
    <fieldset className="layout-gallery">
      <legend className="sr-only">Site layout</legend>
      {presets.map((preset) => <label className="layout-card" data-selected={selection === preset.id} key={preset.id}>
        <div className="layout-mini" data-mini={preset.id} aria-hidden="true">
          <div className="mini-top"><i /><i /><i /><i /></div><div className="mini-side"><i /><i /><i /></div>
          <div className="mini-hero"><i /><i /></div><div className="mini-today"><i /><i /><i /></div>
          <div className="mini-classes"><i /><i /><i /><i /></div>
        </div>
        <span className="layout-name"><input type="radio" name="site-layout" value={preset.id} checked={selection === preset.id} onChange={() => setSelection(preset.id)} /><b>{preset.name}</b>
          {active === preset.id && <span className="ops-status" data-status="complete">Active</span>}</span>
        <span>{preset.description}</span>
      </label>)}
    </fieldset>
    <div className="ops-actions gallery-actions">
      <button type="button" className="btn ghost" disabled={checking} onClick={() => preview ? setPreview(false) : void open()}>{preview ? "Close real-page preview" : "Preview real pages"}</button>
      <button type="button" className="btn" disabled={busy || active === selection} onClick={() => save(selection)}>Save {selected.name} for the site</button>
    </div>
    {error && <p role="alert">Admin sign-in is required for the page preview.</p>}
    {preview && <section className="ops-section">
      <div className="ops-actions preview-controls">
        <label>Page <select aria-label="Preview page" value={page} onChange={(event) => setPage(event.target.value)}>{pages.map(({ name, href }) => <option value={href} key={href}>{name}</option>)}</select></label>
        <label><input type="checkbox" checked={mobile} onChange={(event) => setMobile(event.target.checked)} /> Phone width</label>
      </div>
      <p className="small">Read-only preview. Invitation and maintenance settings apply.</p>
      <div className="live-preview" data-phone={mobile}>
        <iframe key={selection + page} inert title={selected.name + " real-page preview"} src={page} data-sharpstudy-preview={selection} tabIndex={-1} />
      </div>
    </section>}
  </>;
}
