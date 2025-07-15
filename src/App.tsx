import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BrowsePage from "@/pages/browse-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import BookDetails from "@/pages/book-details-page";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/layout";
function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/browse" component={BrowsePage}/> 
        <Route path="/books/:id" component={BookDetails} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return <Router />;
}

export default App;