import type { Request, Response } from "express";

import {
  getGoogleAuthUrl,
  authenticateWithGoogle,
} from "../services/auth.service.ts";

export const googleAuthController = (
  _req: Request,
  res: Response,
) => {
  const url = getGoogleAuthUrl();

  res.redirect(url);
};

export const googleCallbackController = async (
  req: Request,
  res: Response,
) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      message: "Google authorization code is required",
    });
  }

  const result = await authenticateWithGoogle(code);

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

  return res.redirect(
    `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.token)}`,
  );
};

export const googleMeController = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const { prisma } = await import("../lib/prisma.ts");
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        slackConnection: {
          select: {
            id: true,
            teamName: true,
            teamId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingSender = await prisma.sender.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: user.email,
        },
      },
    });

    if (!existingSender) {
      await prisma.sender.create({
        data: {
          userId: user.id,
          email: user.email,
          name: user.name || "Google User",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};