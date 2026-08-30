import { googleOAuthClient } from "../config/google.ts";
import { prisma } from "../lib/prisma.ts";
import jwt from "jsonwebtoken";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const getGoogleAuthUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    prompt: "consent",
  });
};

export const authenticateWithGoogle = async (
  code: string,
) => {
  const { tokens } =
    await googleOAuthClient.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Google access token not received");
  }

  googleOAuthClient.setCredentials(tokens);

  const response =
    await googleOAuthClient.request<GoogleUser>({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });

  const googleUser = response.data;

  if (!googleUser.email) {
    throw new Error("Google account email not available");
  }

  let user = await prisma.user.findUnique({
    where: {
      email: googleUser.email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name || "Google User",
        avatarUrl: googleUser.picture,
      },
    });
  } else {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: googleUser.name || user.name,
        avatarUrl: googleUser.picture ?? user.avatarUrl,
      },
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

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    },
  );

  return {
    user,
    token,
  };
};