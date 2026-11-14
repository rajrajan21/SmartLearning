import { Route, Switch, Router } from "wouter";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/bits";
import { Home } from "./pages/Home";
import { ClassPage, SubjectPage, ChapterPage, TopicPage, LessonPage } from "./pages/Browse";
import { AccountPage } from "./pages/Account";
import { AccountProvider } from "./lib/account";
import { PracticePage } from "./pages/Practice";
import { AdminApp } from "./admin/AdminApp";

export function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/account" component={AccountPage} />
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
