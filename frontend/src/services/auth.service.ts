import { api } from "./api";
import type { AuthUser } from "../types/auth";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export const startGoogleLogin = () => {
  window.location.href =
    "http://localhost:5000/api/auth/google";
};

export const saveAuthSession = (
  token: string,
  user?: AuthUser,
) => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user) {
    sessionStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(user),
    );
  }
};

export const getStoredToken = () => {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  const value = sessionStorage.getItem(AUTH_USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    sessionStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const logout = () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<{
    success: boolean;
    data: AuthUser;
  }>("/auth/me");

  const user = response.data.data;
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
};

export const getSlackConnectUrl = (token: string): string => {
  return `http://localhost:5000/api/auth/slack/connect?token=${encodeURIComponent(token)}`;
};

export const disconnectSlack = async (): Promise<void> => {
  await api.delete("/auth/slack/disconnect");
};