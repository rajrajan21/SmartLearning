import { Route, Switch, Router } from "wouter";
import { lazy, Suspense, type ComponentType } from "react";
import type { ReactElement } from "react";
/** Pages that most visitors never open are loaded the first time they are visited, so the first page opens faster. */
function named<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string) { return lazy(() => load().then((m) => ({ default: m[name] as ComponentType<any> }))); }
const Loading = (): ReactElement => <p role="status" style={{ padding: "2rem", textAlign: "center" }}>Loading…</p>;
const TourPage = named(() => import("./pages/Tour"), "TourPage");
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/bits";
import { Home } from "./pages/Home";
import { ClassPage, SubjectPage, ChapterPage, TopicPage, LessonPage } from "./pages/Browse";
const ClassroomHub = named(() => import("./pages/Classroom"), "ClassroomHub");
const ClassroomPage = named(() => import("./pages/Classroom"), "ClassroomPage");
const ExamPage = named(() => import("./pages/Exam"), "ExamPage");
const WorksheetPage = named(() => import("./pages/Worksheet"), "WorksheetPage");
const PapersListPage = named(() => import("./pages/Papers"), "PapersListPage");
const PaperPage = named(() => import("./pages/Papers"), "PaperPage");
const GamePage = named(() => import("./pages/Games"), "GamePage");
import { SitePage } from "./pages/SitePages";
const ParentPage = named(() => import("./pages/Parent"), "ParentPage");
const RevisePage = named(() => import("./pages/Revise"), "RevisePage");
const GradePathPage = named(() => import("./pages/GradePath"), "GradePathPage");
const TermPaperPage = named(() => import("./pages/TermPaper"), "TermPaperPage");
const MistakesPage = named(() => import("./pages/Mistakes"), "MistakesPage");
const ProgressPage = named(() => import("./pages/Progress"), "ProgressPage");
const AccountPage = named(() => import("./pages/Account"), "AccountPage");
import { AccountProvider } from "./lib/account";
const PracticePage = named(() => import("./pages/Practice"), "PracticePage");
import { AccessGuard } from "./components/AccessGate";
const AdminApp = named(() => import("./admin/AdminApp"), "AdminApp");

const ExplorePage = named(() => import("./pages/Explore"), "ExplorePage");
const NotebookPage = named(() => import("./pages/Notebook"), "NotebookPage");
const BookReaderPage = named(() => import("./pages/Books"), "BookReaderPage");
const BooksPage = named(() => import("./pages/Books"), "BooksPage");
const LibraryPage = named(() => import("./pages/Library"), "LibraryPage");
const LibraryBookPage = named(() => import("./pages/Library"), "LibraryBookPage");
import { ContributePage, MyContributionsPage, ContributorPage } from "./pages/Contribute";
const GkPage = named(() => import("./pages/Gk"), "GkPage");
const GkLessonPage = named(() => import("./pages/Gk"), "GkLessonPage");

const VirtualLabHub = named(() => import("./pages/VirtualLab"), "VirtualLabHub");
const VirtualLabPage = named(() => import("./pages/VirtualLab"), "VirtualLabPage");

export function Routes() {
  return (
    <Suspense fallback={<Loading />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/library/contribute" component={ContributePage} />
      <Route path="/library/my-contributions" component={MyContributionsPage} />
      <Route path="/library/by/:handle" component={ContributorPage} />
      <Route path="/library/:id" component={LibraryBookPage} />
      <Route path="/virtual-lab" component={VirtualLabHub} />
      <Route path="/virtual-lab/:id" component={VirtualLabPage} />
      <Route path="/gk" component={GkPage} />
      <Route path="/gk/:id" component={GkLessonPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/classroom" component={ClassroomHub} />
      <Route path="/classroom/:board/:cls/:subject/:chapter/:topic" component={ClassroomPage} />
      <Route path="/exam/:board/:cls/:subject/:chapter" component={ExamPage} />
      <Route path="/worksheet/:board/:cls/:subject/:chapter" component={WorksheetPage} />
      <Route path="/play/:mode/:board/:cls/:subject/:chapter" component={GamePage} />
      <Route path="/privacy">{() => <SitePage kind="privacy" />}</Route>
      <Route path="/terms">{() => <SitePage kind="terms" />}</Route>
      <Route path="/about">{() => <SitePage kind="about" />}</Route>
      <Route path="/disclaimer">{() => <SitePage kind="disclaimer" />}</Route>
      <Route path="/grievance">{() => <SitePage kind="grievance" />}</Route>
      <Route path="/faq">{() => <SitePage kind="faq" />}</Route>
      <Route path="/guidelines">{() => <SitePage kind="guidelines" />}</Route>
      <Route path="/contact">{() => <SitePage kind="contact" />}</Route>
      <Route path="/parent" component={ParentPage} />
      <Route path="/revise" component={RevisePage} />
      <Route path="/path/:board/:subject" component={GradePathPage} />
      <Route path="/term/:board/:cls/:subject" component={TermPaperPage} />
      <Route path="/mistakes" component={MistakesPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/notebook" component={NotebookPage} />
      <Route path="/books" component={BooksPage} />
      <Route path="/papers" component={PapersListPage} />
      <Route path="/papers/:id" component={PaperPage} />
      <Route path="/tour" component={TourPage} />
      <Route path="/:board/:cls" component={ClassPage} />
      <Route path="/:board/:cls/:subject" component={SubjectPage} />
      <Route path="/:board/:cls/:subject/:chapter" component={ChapterPage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic/learn" component={LessonPage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic/practice" component={PracticePage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic" component={TopicPage} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

/** The whole site: the book reader fills the screen by itself, every other page sits inside the normal layout. */
export function Site() {
  return (
    <Switch>
      <Route path="/books/:cls/:file" component={BookReaderPage} />
      <Route path="/books/:cls/:file/:chapter" component={BookReaderPage} />
      <Route><Layout><Routes /></Layout></Route>
    </Switch>
  );
}

export function App({ ssrPath, waitForLatest }: { ssrPath?: string; waitForLatest?: boolean }) {
  void ssrPath;
  return (
    <Router>
      <Switch>
        <Route path="/admin" nest><AdminApp /></Route>
        <Route>
          <AccessGuard>
          <SettingsProvider waitForLatest={waitForLatest}>
            <AccountProvider>
              <Site />
            </AccountProvider>
          </SettingsProvider>
          </AccessGuard>
        </Route>
      </Switch>
    </Router>
  );
}
