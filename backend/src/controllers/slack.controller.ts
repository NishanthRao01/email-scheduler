import type { RequestHandler } from "express";
import crypto from "node:crypto";

import {
  getSlackAuthUrl,
  connectSlack,
} from "../services/slack.service.ts";

const stateStore = new Map<
  string,
  {
    userId: string;
    expiresAt: number;
  }
>();

export const slackAuthController: RequestHandler = (
  req,
  res,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const state = crypto.randomBytes(32).toString("hex");

  stateStore.set(state, {
    userId: req.user.userId,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const url = getSlackAuthUrl(state);

  res.redirect(url);
};

export const slackCallbackController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { code, state } = req.query;

    if (
      typeof code !== "string" ||
      typeof state !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Slack code and state are required",
      });
    }

    const storedState = stateStore.get(state);

    if (!storedState) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    stateStore.delete(state);

    if (storedState.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OAuth state has expired",
      });
    }

    const connection = await connectSlack(
      code,
      storedState.userId,
    );

    return res.status(200).json({
      success: true,
      message: "Slack connected successfully",
      data: {
        id: connection.id,
        userId: connection.userId,
        teamId: connection.teamId,
        teamName: connection.teamName,
      },
    });
  } catch (error) {
    next(error);
  }
};