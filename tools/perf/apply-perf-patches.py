#!/usr/bin/env python3
"""Adds the speed changes to files that other jobs also edit (small, anchored, safe to run twice).
Usage: python3 tools/perf/apply-perf-patches.py <project folder>
Each edit is skipped when its marker is already present, and reported when its anchor is not found (nothing else is touched)."""
import sys, re, pathlib

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
report = []

def patch(rel, edits):
    p = root / rel
    if not p.exists():
        report.append(f"MISSING  {rel}"); return
    raw = p.read_bytes()
    crlf = b"\r\n" in raw
    s = raw.decode("utf-8").replace("\r\n", "\n")
    changed = False
    for name, marker, anchor, new in edits:
        if marker in s:
            report.append(f"already  {rel}: {name}"); continue
        if anchor not in s:
            report.append(f"ANCHOR NOT FOUND  {rel}: {name}"); continue
        s = s.replace(anchor, new, 1); changed = True
        report.append(f"patched  {rel}: {name}")
    if changed:
        if crlf: s = s.replace("\n", "\r\n")
        p.write_bytes(s.encode("utf-8"))

# ---- API: app.ts -------------------------------------------------------------------------------------------------
patch("apps/api/src/app.ts", [
    ("imports", "modules/perf/routes.js",
     'import { reportRoutes, type ReportsService } from "./modules/stats/reports.js";',
     'import { reportRoutes, type ReportsService } from "./modules/stats/reports.js";\nimport { adminPerfRoutes, perfConfigMiddleware } from "./modules/perf/routes.js";\nimport { perf } from "./modules/perf/config.js";'),
    ("deps", "perf?: { seedStateFile",
     "  adminUserId?: string;\n",
     "  adminUserId?: string;\n  /** speed: where the start-up 'already loaded' marks are kept (shown on Admin > Site and performance) */\n  perf?: { seedStateFile?: string };\n"),
    ("settings middleware", "perfConfigMiddleware(deps.settings)",
     '  app.use(express.json({ limit: "200kb" }));',
     '  app.use(express.json({ limit: "200kb" }));\n  app.use(perfConfigMiddleware(deps.settings)); // copies the admin "perf.*" settings into the speed config'),
    ("admin route", "/api/v1/admin/perf",
     '  app.use("/api/v1/admin", adminSettingsRoutes(deps.settings, deps.adminKey, deps.adminUserId));',
     '  app.use("/api/v1/admin/perf", adminPerfRoutes({ classroom: deps.classroom, curriculum: deps.curriculum, seedStateFile: deps.perf?.seedStateFile }, deps.adminKey, deps.adminUserId));\n  app.use("/api/v1/admin", adminSettingsRoutes(deps.settings, deps.adminKey, deps.adminUserId));'),
    ("compress import", "modules/perf/compress.js",
     'import { perf } from "./modules/perf/config.js";',
     'import { perf } from "./modules/perf/config.js";\nimport { compressJson, compressedStatic } from "./modules/perf/compress.js";'),
    ("compress json", "app.use(compressJson())",
     '  app.use(perfConfigMiddleware(deps.settings)); // copies the admin "perf.*" settings into the speed config',
     '  app.use(perfConfigMiddleware(deps.settings)); // copies the admin "perf.*" settings into the speed config\n  app.use(compressJson()); // smaller answers on the wire (Admin > Site and performance > Speed)'),
    ("compress static", "app.use(compressedStatic(dir))",
     '    app.use(express.static(dir, {',
     '    app.use(compressedStatic(dir));\n    app.use(express.static(dir, {'),
    ("picture cache", "staticCacheSeconds",
     '      setHeaders(res, file) {\n',
     '      setHeaders(res, file) {\n        if (/\\/pictures\\//.test(file.replace(/\\\\/g, "/"))) { const secs = perf().staticCacheSeconds; res.setHeader("Cache-Control", secs > 0 ? `public, max-age=${secs}` : "no-cache"); return; } // lesson pictures: kept by the browser (Admin > Site and performance)\n'),
])

# ---- API: server.ts ----------------------------------------------------------------------------------------------
patch("apps/api/src/server.ts", [
    ("seed import", "seedStatusFile",
     'import { createPgliteDb, seedAll } from "./db/dev.js";',
     'import { createPgliteDb, seedAll, seedStatusFile } from "./db/dev.js";'),
    ("seed call", "stateFile: seedStatusFile(dir)",
     '  await seedAll(db); // idempotent; keeps dev data in step with content/curriculum/*.json\n',
     '  // Idempotent; keeps the database in step with content/. Only new or changed files are loaded (marks kept next to the database folder);\n  // SEED_FORCE=1 loads everything again, SEED_VERBOSE=1 prints one line per file.\n  await seedAll(db, { stateFile: seedStatusFile(dir), lenient: true, force: process.env.SEED_FORCE === "1", quiet: process.env.SEED_VERBOSE !== "1" });\n'),
    ("classroom service", "const classroomSvc",
     "const app = createApp({",
     'const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");\nconst classroomSvc = createClassroomService({ lessonsDir, questionsDir, classroomDir, cacheFile: process.env.CLASSROOM_CACHE ?? resolve(root, "data/cache/classroom-built.json"), codeDir: resolve(root, "packages/shared/src") }, audio);\nconst app = createApp({ perf: { seedStateFile: process.env.DATABASE_URL ? undefined : seedStatusFile(process.env.PGLITE_DIR ?? ".data/pglite") }, '),
    ("use classroom service", "classroom: classroomSvc",
     "classroom: createClassroomService({ lessonsDir, questionsDir, classroomDir }, audio),",
     "classroom: classroomSvc,"),
    ("prewarm", "classroomSvc.warm",
     "app.listen(port, () => console.log(`${SITE.name} API listening on :${port}`));",
     "app.listen(port, () => {\n  console.log(`${SITE.name} API listening on :${port}`);\n  // build the classroom boards in the background just after start so the first visitor does not wait (Admin > Site and performance > Speed)\n  setTimeout(() => { void settingsSvc.all().then((v) => { if (v[\"perf.prewarm\"] === false) return; const r = classroomSvc.warm?.(); if (r) console.log(`classroom boards ready: ${r.lessons} lessons in ${(r.ms / 1000).toFixed(1)} s`); }).catch(() => undefined); }, 500).unref();\n});"),
])

# ---- shared settings.ts ------------------------------------------------------------------------------------------
patch("packages/shared/src/settings.ts", [
    ("import", 'from "./perf-settings.js"',
     'import { VISUALS_SETTINGS } from "./visuals-settings.js";',
     'import { VISUALS_SETTINGS } from "./visuals-settings.js";\nimport { PERF_SETTINGS } from "./perf-settings.js";'),
    ("spread", "...PERF_SETTINGS",
     "  ...VISUALS_SETTINGS,\n",
     "  ...VISUALS_SETTINGS,\n  ...PERF_SETTINGS,\n"),
])

# ---- web: admin card + lazy pages ---------------------------------------------------------------------------------
patch("apps/web/src/admin/AdminApp.tsx", [
    ("import", 'from "./PerfAdmin"',
     'import { VisualsAdmin } from "./VisualsAdmin";',
     'import { VisualsAdmin } from "./VisualsAdmin";\nimport { PerfAdmin } from "./PerfAdmin";'),
    ("card", "<PerfAdmin />",
     '              {panel.id === "site" && <Branding values={draft} onVersion={(k, v) => set(k, v)} />}',
     '              {panel.id === "site" && <Branding values={draft} onVersion={(k, v) => set(k, v)} />}\n              {panel.id === "site" && <PerfAdmin />}'),
])

app_edits = [
    ("react import", "Suspense",
     'import { TourPage } from "./pages/Tour";',
     'import { lazy, Suspense, type ComponentType } from "react";\nimport type { ReactElement } from "react";\n/** Pages that most visitors never open are loaded the first time they are visited, so the first page opens faster. */\nfunction named<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string) { return lazy(() => load().then((m) => ({ default: m[name] as ComponentType<any> }))); }\nconst Loading = (): ReactElement => <p role="status" style={{ padding: "2rem", textAlign: "center" }}>Loading…</p>;'),
]
lazy_pages = [
    ('import { TourPage } from "./pages/Tour";', 'const TourPage = named(() => import("./pages/Tour"), "TourPage");'),
    ('import { ExamPage } from "./pages/Exam";', 'const ExamPage = named(() => import("./pages/Exam"), "ExamPage");'),
    ('import { WorksheetPage } from "./pages/Worksheet";', 'const WorksheetPage = named(() => import("./pages/Worksheet"), "WorksheetPage");'),
    ('import { PapersListPage, PaperPage } from "./pages/Papers";', 'const PapersListPage = named(() => import("./pages/Papers"), "PapersListPage");\nconst PaperPage = named(() => import("./pages/Papers"), "PaperPage");'),
    ('import { GamePage } from "./pages/Games";', 'const GamePage = named(() => import("./pages/Games"), "GamePage");'),
    ('import { ParentPage } from "./pages/Parent";', 'const ParentPage = named(() => import("./pages/Parent"), "ParentPage");'),
    ('import { GradePathPage } from "./pages/GradePath";', 'const GradePathPage = named(() => import("./pages/GradePath"), "GradePathPage");'),
    ('import { TermPaperPage } from "./pages/TermPaper";', 'const TermPaperPage = named(() => import("./pages/TermPaper"), "TermPaperPage");'),
    ('import { AdminApp } from "./admin/AdminApp";', 'const AdminApp = named(() => import("./admin/AdminApp"), "AdminApp");'),
    ('import { BookReaderPage, BooksPage } from "./pages/Books";', 'const BookReaderPage = named(() => import("./pages/Books"), "BookReaderPage");\nconst BooksPage = named(() => import("./pages/Books"), "BooksPage");'),
    ('import { LibraryPage, LibraryBookPage } from "./pages/Library";', 'const LibraryPage = named(() => import("./pages/Library"), "LibraryPage");\nconst LibraryBookPage = named(() => import("./pages/Library"), "LibraryBookPage");'),
    ('import { GkPage, GkLessonPage } from "./pages/Gk";', 'const GkPage = named(() => import("./pages/Gk"), "GkPage");\nconst GkLessonPage = named(() => import("./pages/Gk"), "GkLessonPage");'),
    ('import { ClassroomHub, ClassroomPage } from "./pages/Classroom";', 'const ClassroomHub = named(() => import("./pages/Classroom"), "ClassroomHub");\nconst ClassroomPage = named(() => import("./pages/Classroom"), "ClassroomPage");'),
    ('import { RevisePage } from "./pages/Revise";', 'const RevisePage = named(() => import("./pages/Revise"), "RevisePage");'),
    ('import { MistakesPage } from "./pages/Mistakes";', 'const MistakesPage = named(() => import("./pages/Mistakes"), "MistakesPage");'),
    ('import { ProgressPage } from "./pages/Progress";', 'const ProgressPage = named(() => import("./pages/Progress"), "ProgressPage");'),
    ('import { AccountPage } from "./pages/Account";', 'const AccountPage = named(() => import("./pages/Account"), "AccountPage");'),
    ('import { PracticePage } from "./pages/Practice";', 'const PracticePage = named(() => import("./pages/Practice"), "PracticePage");'),
    ('import { ExplorePage } from "./pages/Explore";', 'const ExplorePage = named(() => import("./pages/Explore"), "ExplorePage");'),
    ('import { NotebookPage } from "./pages/Notebook";', 'const NotebookPage = named(() => import("./pages/Notebook"), "NotebookPage");'),
]

patch("apps/web/src/pages/Home.tsx", [
    ("lazy GK cards import", 'import("./Gk")',
     'import { GkTodayCards } from "./Gk";',
     'import { lazy, Suspense } from "react";\nconst GkTodayCards = lazy(() => import("./Gk").then((m) => ({ default: m.GkTodayCards }))); // the GK page code is loaded only when the cards are shown'),
    ("lazy GK cards use", "<Suspense fallback={null}><GkTodayCards",
     "<GkTodayCards home />",
     "<Suspense fallback={null}><GkTodayCards home /></Suspense>"),
])

# lazy pages: replace each static import by a lazy one, and wrap the route switch in Suspense
p = root / "apps/web/src/App.tsx"
if p.exists():
    raw = p.read_bytes(); crlf = b"\r\n" in raw
    s = raw.decode("utf-8").replace("\r\n", "\n")
    n = 0
    for old, new in lazy_pages:
        if old in s: s = s.replace(old, new, 1); n += 1
    if "Suspense" not in s:
        head = app_edits[0]
        first_import = 'import { Route, Switch, Router } from "wouter";'
        if first_import in s:
            s = s.replace(first_import, first_import + "\n" + head[3].split("\n", 1)[0] + "\n" + "\n".join(head[3].split("\n")[1:]), 1)
        if "<Switch>" in s and "</Switch>" in s:
            s = s.replace("<Switch>", "<Suspense fallback={<Loading />}>\n    <Switch>", 1).replace("</Switch>", "</Switch>\n    </Suspense>", 1)
    if n:
        if crlf: s = s.replace("\n", "\r\n")
        p.write_bytes(s.encode("utf-8")); report.append(f"patched  App.tsx: {n} lazy pages")
print("\n".join(report))
