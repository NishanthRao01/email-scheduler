import { prisma } from "../lib/prisma.ts";
import { slackOAuthConfig } from "../config/slack.ts";
import { WebClient } from "@slack/web-api";

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

export const sendHourlyLimitNotification = async ({
  userId,
  senderEmail,
}: {
  userId: string;
  senderEmail: string;
}) => {
  const connection =
    await prisma.slackConnection.findUnique({
      where: {
        userId,
      },
    });

  if (!connection) {
    console.log(
      `Slack is not connected for user ${userId}.`,
    );

    return;
  }

  const slack = new WebClient(
    connection.accessToken,
  );

  const channelId = process.env.SLACK_NOTIFICATION_CHANNEL_ID || "C0BTLB7JBRU";

  try {
    try {
      await slack.conversations.join({ channel: channelId });
      console.log(`Slack bot successfully joined channel ${channelId}`);
    } catch (joinErr) {
      console.log(`Auto-join channel ${channelId} failed, checking message post:`, joinErr);
    }

    const postResponse = await slack.chat.postMessage({
      channel: channelId,
      text:
        `⚠️ Hourly email limit reached for sender ` +
        `${senderEmail}. Remaining emails will be retried in the next hour.`,
    });

    if (!postResponse.ok) {
      throw new Error(postResponse.error || "Failed to post Slack message");
    }

    console.log(
      `Slack notification sent for sender ${senderEmail}.`,
    );
  } catch (error: any) {
    console.error(`Slack chat.postMessage failed for channel ${channelId}:`, error);
    if (error.data?.error === "not_in_channel") {
      throw new Error(`Slack Bot is not in channel ${channelId}. Please invite the Bot using "/invite" inside the Slack channel.`);
    }
    throw error;
  }
};