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
import { AdminApp } from "./admin/AdminApp";

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
      <Route path="/parent" component={ParentPage} />
      <Route path="/revise" component={RevisePage} />
      <Route path="/progress" component={ProgressPage} />
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

export function App({ ssrPath }: { ssrPath?: string }) {
  void ssrPath;
  return (
    <Router>
      <Switch>
        <Route path="/admin" nest><AdminApp /></Route>
        <Route>
          <SettingsProvider>
            <AccountProvider>
              <Layout><Routes /></Layout>
            </AccountProvider>
          </SettingsProvider>
        </Route>
      </Switch>
    </Router>
  );
}
