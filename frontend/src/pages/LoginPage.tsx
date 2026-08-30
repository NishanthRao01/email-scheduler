import { useState } from "react";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";

export const LoginPage = () => {
  const [showTip, setShowTip] = useState(false);

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Login</h1>

        <GoogleLoginButton />

        <div className="login-divider">
          <span>or sign up through email</span>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            setShowTip(true);
          }}
        >
          <input
            type="email"
            placeholder="Email ID"
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          {showTip && (
            <div className="login-tip">
              ⚠️ Email login is placeholder. Please use the "Login with Google" button above.
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
};