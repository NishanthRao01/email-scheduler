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

  return res.status(200).json({
    success: true,
    message: "Google authentication successful",
    user: result.user,
    token: result.token,
  });
};