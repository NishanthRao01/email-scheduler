import { useEffect, useState } from "react";
import { saveAuthSession } from "../services/auth.service";

export const AuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setTimeout(() => {
        setError("Authentication token was not received.");
      }, 0);
      return;
    }

    saveAuthSession(token);

    window.history.replaceState(
      {},
      document.title,
      "/auth/callback",
    );

    window.location.replace("/dashboard");
  }, []);

  if (error) {
    return (
      <main className="auth-callback-page">
        <div className="auth-callback-card">
          <div className="error-icon">!</div>

          <h1>Authentication failed</h1>

          <p>{error}</p>

          <a href="/login" className="primary-button">
            Back to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-callback-page">
      <div className="auth-callback-card">
        <div className="loading-spinner" />

        <h1>Signing you in</h1>

        <p>Please wait while we finish authentication.</p>
      </div>
    </main>
  );
};