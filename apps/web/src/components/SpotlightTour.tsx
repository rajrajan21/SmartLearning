import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { previewFrame } from "../lib/sitePresets";
import {
  canAutoOpenTour,
  getTourSteps,
  incrementSessionAutoCount,
  isClassroomAudioPlaying,
  markTourDismissed,
  pageSettingKey,
  type HelpQuickJump,
  type TourPageType,
  type TourStep,
} from "../lib/spotlightTour";
import "./spotlight-tour.css";

export interface PageTourConfig {
  pageType: TourPageType;
  tourActive?: boolean;
  steps?: TourStep[];
  quickJumps?: HelpQuickJump[];
}

interface ResolvedStep {
  step: TourStep;
  el: HTMLElement;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SpotlightContextValue {
  register: (id: string, config: PageTourConfig) => void;
  unregister: (id: string) => void;
  startTour: () => void;
}

const SpotlightContext = createContext<SpotlightContextValue | null>(null);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resolveSteps(steps: TourStep[]): ResolvedStep[] {
  if (typeof document === "undefined") return [];
  const out: ResolvedStep[] = [];
  for (const step of steps) {
    const el = document.querySelector<HTMLElement>(step.selector);
    if (el) out.push({ step, el });
  }
  return out;
}

function measureTarget(el: HTMLElement): Rect | null {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  const pad = 8;
  const vw = window.innerWidth || 1024;
  const vh = window.innerHeight || 768;
  const left = Math.max(4, r.left - pad);
  const top = Math.max(4, r.top - pad);
  const right = Math.min(vw - 4, r.right + pad);
  const bottom = Math.min(vh - 4, r.bottom + pad);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export function usePageTour(config: PageTourConfig | null) {
  const ctx = useContext(SpotlightContext);
  const idRef = useRef(`pt-${Math.random().toString(36).slice(2)}`);
  const key = config
    ? [
        config.pageType,
        config.tourActive !== false ? "1" : "0",
        (config.steps ?? []).map((s) => s.id).join(","),
        (config.quickJumps ?? []).map((q) => `${q.id}:${q.href}:${q.label}`).join(","),
      ].join("|")
    : "";
  const latest = useRef(config);
  latest.current = config;

  useEffect(() => {
    if (!ctx) return;
    const id = idRef.current;
    if (!latest.current) {
      ctx.unregister(id);
      return;
    }
    ctx.register(id, latest.current);
    return () => ctx.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, key]);
}

export function SpotlightProvider({ children }: { children: ReactNode }) {
  const s = useSettings();
  const ta = s.lang === "ta";
  const [entries, setEntries] = useState<Array<{ id: string; config: PageTourConfig }>>([]);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [resolved, setResolved] = useState<ResolvedStep[]>([]);
  const [rect, setRect] = useState<Rect | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  const register = useCallback((id: string, config: PageTourConfig) => {
    setEntries((prev) => {
      const rest = prev.filter((item) => item.id !== id);
      return [...rest, { id, config }];
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const activeEntry = entries.length > 0 ? entries[entries.length - 1]!.config : null;
  const pageType = activeEntry?.pageType;
  const tourActive = activeEntry ? activeEntry.tourActive !== false : false;
  const configuredSteps = useMemo(
    () => (activeEntry ? (activeEntry.steps ?? getTourSteps(activeEntry.pageType)) : []),
    [activeEntry],
  );
  const quickJumps = activeEntry?.quickJumps ?? [];

  const tourEnabled = s.get("ux.spotlightTour.enabled") !== false;
  const pageEnabled = pageType ? s.get(pageSettingKey(pageType)) !== false : false;
  const autoOpen = s.get("ux.spotlightTour.autoOpen") !== false;
  const maxAuto = Number(s.get("ux.spotlightTour.maxAutoPerSession") ?? 1);
  const autoDelayMs = Number(s.get("ux.spotlightTour.autoDelayMs") ?? 900);
  const helpHubEnabled = s.get("ux.helpHub.enabled") !== false;
  const quickJumpsEnabled = s.get("ux.helpHub.quickJumps") !== false;
  const helpHubPos = s.get<string>("ux.helpHub.position") === "left" ? "left" : "right";
  const helpHubTitle = s.text("ux.helpHub.title") || (ta ? "படிப்பு உதவி" : "Study help");
  const maintenance = s.get("site.maintenance.enabled") === true;
  const isPreview = Boolean(previewFrame());

  const closeTour = useCallback(
    (persist: boolean) => {
      if (persist && pageType) {
        markTourDismissed(pageType);
      }
      setOpen(false);
      setStepIndex(0);
      setResolved([]);
      setRect(null);
    },
    [pageType],
  );

  const launchTour = useCallback(
    (isAuto: boolean): boolean => {
      if (!pageType || !tourEnabled || !pageEnabled) return false;
      const found = resolveSteps(configuredSteps);
      if (found.length === 0) return false;
      if (isAuto) {
        if (
          !canAutoOpenTour({
            pageType,
            tourEnabled,
            pageEnabled,
            autoOpen,
            maxAutoPerSession: maxAuto,
            isPreview,
            isMaintenance: maintenance,
          })
        ) {
          return false;
        }
        incrementSessionAutoCount();
      }
      setHelpOpen(false);
      setResolved(found);
      setStepIndex(0);
      setOpen(true);
      return true;
    },
    [autoOpen, configuredSteps, isPreview, maintenance, maxAuto, pageEnabled, pageType, tourEnabled],
  );

  const startTour = useCallback(() => {
    launchTour(false);
  }, [launchTour]);

  // Reset overlays when switching pages
  useEffect(() => {
    setOpen(false);
    setHelpOpen(false);
    setStepIndex(0);
  }, [pageType]);

  // Smart first-visit auto-open with anti-fatigue rules
  useEffect(() => {
    if (!pageType || !tourActive || open) return;
    if (
      !canAutoOpenTour({
        pageType,
        tourEnabled,
        pageEnabled,
        autoOpen,
        maxAutoPerSession: maxAuto,
        isPreview,
        isMaintenance: maintenance,
      })
    ) {
      return;
    }
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    const timer = window.setTimeout(() => {
      if (cancelled || isClassroomAudioPlaying()) return;
      launchTour(true);
    }, Math.max(0, autoDelayMs));
    const main = typeof document !== "undefined" ? document.getElementById("main") : null;
    main?.addEventListener("pointerdown", cancel, { once: true });
    main?.addEventListener("click", cancel, { once: true });
    window.addEventListener("keydown", cancel, { once: true });
    return () => {
      window.clearTimeout(timer);
      main?.removeEventListener("pointerdown", cancel);
      main?.removeEventListener("click", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [autoDelayMs, autoOpen, isPreview, launchTour, maintenance, maxAuto, open, pageEnabled, pageType, tourActive, tourEnabled]);

  // Measure target rect & scroll smoothly into view on step change
  const current = resolved[stepIndex];
  useEffect(() => {
    if (!open || !current) return;
    try {
      current.el.scrollIntoView({
        behavior: reducedMotion() ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    } catch {
      /* jsdom may not implement scrollIntoView */
    }
    const update = () => setRect(measureTarget(current.el));
    update();
    const raf = window.requestAnimationFrame(update);
    const settle = window.setTimeout(update, 260);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open, current]);

  // Move focus into the spotlight card when opened/stepped
  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open, stepIndex]);

  // Keyboard support: Esc dismisses, Left/Right steps through
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeTour(true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        if (stepIndex + 1 >= resolved.length) closeTour(true);
        else setStepIndex((i) => i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        if (stepIndex > 0) setStepIndex((i) => i - 1);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [closeTour, open, resolved.length, stepIndex]);

  // Close Help Hub popover on Escape or outside click
  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [helpOpen]);

  const ctxValue = useMemo<SpotlightContextValue>(
    () => ({ register, unregister, startTour }),
    [register, unregister, startTour],
  );

  // Compute desktop card placement relative to highlighted target rect
  const cardStyle = useMemo(() => {
    if (!rect || typeof window === "undefined") return undefined;
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;
    if (vw <= 640) return undefined; // mobile uses fixed bottom card via CSS
    const cardW = Math.min(340, vw - 32);
    const estH = 210;
    const gap = 14;
    const spaceBelow = vh - (rect.top + rect.height);
    const placeAbove = spaceBelow < estH + gap && rect.top > estH + gap;
    const top = placeAbove
      ? Math.max(16, rect.top - estH - gap)
      : Math.min(vh - estH - 16, rect.top + rect.height + gap);
    const left = Math.max(16, Math.min(vw - cardW - 16, rect.left + rect.width / 2 - cardW / 2));
    return { top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, width: `${Math.round(cardW)}px` };
  }, [rect]);

  const showHelpHub = Boolean(activeEntry) && helpHubEnabled && !maintenance && !isPreview;
  const canReplayTour = Boolean(activeEntry) && tourActive && tourEnabled && pageEnabled && configuredSteps.length > 0;
  const visibleQuickJumps = quickJumpsEnabled ? quickJumps : [];
  const isLast = stepIndex + 1 >= resolved.length;

  return (
    <SpotlightContext.Provider value={ctxValue}>
      {children}

      {showHelpHub && (
        <div className={`help-hub${helpHubPos === "left" ? " help-hub-left" : ""} noprint`} ref={hubRef}>
          {helpOpen && (
            <div className="help-hub-menu" role="dialog" aria-label={helpHubTitle}>
              <div className="help-hub-head">
                <b>{helpHubTitle}</b>
                <button
                  type="button"
                  className="help-hub-close"
                  aria-label={ta ? "உதவி மெனுவை மூடு" : "Close study help"}
                  onClick={() => setHelpOpen(false)}
                >
                  ×
                </button>
              </div>
              {canReplayTour && (
                <button type="button" className="btn help-hub-tour-btn" onClick={startTour}>
                  ✨ {ta ? "இந்தப் பக்க வழிகாட்டியைப் பார்" : "Replay page tour"}
                </button>
              )}
              {visibleQuickJumps.length > 0 && (
                <nav className="help-hub-jumps" aria-label={ta ? "விரைவு இணைப்புகள்" : "Quick jumps"}>
                  <p className="help-hub-label">{ta ? "விரைவு இணைப்புகள்" : "Quick jumps"}</p>
                  <ul>
                    {visibleQuickJumps.map((item) => (
                      <li key={item.id}>
                        <Link href={item.href} className="help-hub-link" onClick={() => setHelpOpen(false)}>
                          <span aria-hidden="true">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}
          <button
            type="button"
            className={`help-hub-fab${helpOpen ? " open" : ""}`}
            aria-label={ta ? "உதவி மற்றும் பக்க வழிகாட்டி" : "Help and page tour"}
            aria-expanded={helpOpen}
            aria-haspopup="dialog"
            onClick={() => setHelpOpen((v) => !v)}
          >
            ?
          </button>
        </div>
      )}

      {open && current && (
        <div className="spotlight-root noprint" data-tour-page={pageType}>
          {rect ? (
            <>
              <div
                className="spotlight-shade"
                style={{ top: 0, left: 0, right: 0, height: `${rect.top}px` }}
                onClick={() => closeTour(true)}
                aria-hidden="true"
              />
              <div
                className="spotlight-shade"
                style={{ top: `${rect.top}px`, left: 0, width: `${rect.left}px`, height: `${rect.height}px` }}
                onClick={() => closeTour(true)}
                aria-hidden="true"
              />
              <div
                className="spotlight-shade"
                style={{
                  top: `${rect.top}px`,
                  left: `${rect.left + rect.width}px`,
                  right: 0,
                  height: `${rect.height}px`,
                }}
                onClick={() => closeTour(true)}
                aria-hidden="true"
              />
              <div
                className="spotlight-shade"
                style={{ top: `${rect.top + rect.height}px`, left: 0, right: 0, bottom: 0 }}
                onClick={() => closeTour(true)}
                aria-hidden="true"
              />
              <div
                className="spotlight-ring"
                style={{
                  top: `${rect.top}px`,
                  left: `${rect.left}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                }}
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="spotlight-shade spotlight-shade-full" onClick={() => closeTour(true)} aria-hidden="true" />
          )}

          <div
            ref={cardRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotlight-title"
            aria-describedby="spotlight-body"
            className={`spotlight-card${!rect ? " spotlight-card-centered" : ""}`}
            style={cardStyle}
          >
            <div className="spotlight-head">
              <span className="spotlight-badge">
                {stepIndex + 1} {ta ? "/" : "of"} {resolved.length}
              </span>
              <button type="button" className="spotlight-skip" onClick={() => closeTour(true)}>
                {ta ? "தவிர்" : "Skip"}
              </button>
            </div>
            <h3 id="spotlight-title">{s.name(current.step.title)}</h3>
            <p id="spotlight-body">{s.name(current.step.body)}</p>
            <div className="spotlight-foot">
              <button
                type="button"
                className="btn ghost spotlight-prev"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                {ta ? "முந்தையது" : "Previous"}
              </button>
              <button
                type="button"
                className="btn spotlight-next"
                onClick={() => {
                  if (isLast) closeTour(true);
                  else setStepIndex((i) => i + 1);
                }}
              >
                {isLast ? (ta ? "புரிந்தது!" : "Got it!") : (ta ? "அடுத்து" : "Next")}
              </button>
            </div>
          </div>
        </div>
      )}
    </SpotlightContext.Provider>
  );
}
