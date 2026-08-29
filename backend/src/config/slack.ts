import { WebClient } from "@slack/web-api";

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const redirectUri = process.env.SLACK_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
  throw new Error(
    "Missing Slack OAuth environment variables",
  );
}

export const slackOAuthConfig = {
  clientId,
  clientSecret,
  redirectUri,
};

export const createSlackClient = (token: string) => {
  return new WebClient(token);
};