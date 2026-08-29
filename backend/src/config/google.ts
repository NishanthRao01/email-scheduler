import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
  throw new Error(
    "Missing Google OAuth environment variables",
  );
}

export const googleOAuthClient = new OAuth2Client(
  clientId,
  clientSecret,
  redirectUri,
);

export const googleOAuthConfig = {
  clientId,
  clientSecret,
  redirectUri,
};