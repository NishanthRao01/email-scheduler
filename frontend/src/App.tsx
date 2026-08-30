import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { getStoredToken } from "./services/auth.service";

export default function App() {
  const path = window.location.pathname;
  const hasToken = !!getStoredToken();

  if (path === "/auth/callback") {
    return <AuthCallbackPage />;
  }

  if (hasToken) {
    if (path !== "/dashboard") {
      window.history.replaceState({}, document.title, "/dashboard");
    }
    return <DashboardPage />;
  }

  if (path !== "/login" && path !== "/") {
    window.history.replaceState({}, document.title, "/login");
  }
  return <LoginPage />;
}