import { prisma } from "../lib/prisma.ts";
import { slackOAuthConfig } from "../config/slack.ts";

export const getSlackAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: slackOAuthConfig.clientId,
    scope: "chat:write",
    redirect_uri: slackOAuthConfig.redirectUri,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
};

export const connectSlack = async (
  code: string,
  userId: string,
) => {
  const body = new URLSearchParams({
    client_id: slackOAuthConfig.clientId,
    client_secret: slackOAuthConfig.clientSecret,
    code,
    redirect_uri: slackOAuthConfig.redirectUri,
  });

  const response = await fetch(
    "https://slack.com/api/oauth.v2.access",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const data = await response.json() as {
    ok: boolean;
    error?: string;
    access_token?: string;
    team?: {
      id?: string;
      name?: string;
    };
  };

  if (!data.ok || !data.access_token) {
    throw new Error(
      data.error ?? "Slack OAuth failed",
    );
  }

  const connection =
    await prisma.slackConnection.upsert({
      where: {
        userId,
      },
      update: {
        accessToken: data.access_token,
        teamId: data.team?.id,
        teamName: data.team?.name,
      },
      create: {
        userId,
        accessToken: data.access_token,
        teamId: data.team?.id,
        teamName: data.team?.name,
      },
    });

  return connection;
};