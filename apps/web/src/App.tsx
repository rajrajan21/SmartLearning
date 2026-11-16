import { Route, Switch, Router } from "wouter";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/bits";
import { Home } from "./pages/Home";
import { ClassPage, SubjectPage, ChapterPage, TopicPage, LessonPage } from "./pages/Browse";
import { ClassroomHub, ClassroomPage } from "./pages/Classroom";
import { ExamPage } from "./pages/Exam";
import { WorksheetPage } from "./pages/Worksheet";
import { GamePage } from "./pages/Games";
import { SitePage } from "./pages/SitePages";
import { ParentPage } from "./pages/Parent";
import { RevisePage } from "./pages/Revise";
import { ProgressPage } from "./pages/Progress";
import { AccountPage } from "./pages/Account";
import { AccountProvider } from "./lib/account";
import { PracticePage } from "./pages/Practice";
import { AccessGuard } from "./components/AccessGate";
import { AdminApp } from "./admin/AdminApp";

import { ExplorePage } from "./pages/Explore";
import { NotebookPage } from "./pages/Notebook";
import { BookReaderPage, BooksPage } from "./pages/Books";

export function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <Route path="/progress" component={ProgressPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/notebook" component={NotebookPage} />
      <Route path="/books" component={BooksPage} />
      <Route path="/:board/:cls" component={ClassPage} />
      <Route path="/:board/:cls/:subject" component={SubjectPage} />
      <Route path="/:board/:cls/:subject/:chapter" component={ChapterPage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic/learn" component={LessonPage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic/practice" component={PracticePage} />
      <Route path="/:board/:cls/:subject/:chapter/:topic" component={TopicPage} />
      <Route component={NotFound} />
    </Switch>
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
