import type { RequestHandler } from "express";

import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
  getSenders,
} from "../services/email.services.ts";

import { validateScheduleEmailInput } from "../validators/email.validator.ts";

export const scheduleEmailsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const input = validateScheduleEmailInput({
      ...req.body,
      userId: req.user.userId,
    });

    const campaign = await scheduleEmails(input);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduledEmailsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const emails = await getScheduledEmails(req.user.userId);

    res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    next(error);
  }
};

export const getSentEmailsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const emails = await getSentEmails(req.user.userId);

    res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    next(error);
  }
};

export const getSendersController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { prisma } = await import("../lib/prisma.ts");

    const existingSender = await prisma.sender.findUnique({
      where: {
        userId_email: {
          userId: req.user.userId,
          email: req.user.email,
        },
      },
    });

    if (!existingSender) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      await prisma.sender.create({
        data: {
          userId: req.user.userId,
          email: req.user.email,
          name: dbUser?.name || "Google User",
        },
      });
    }

    const senders = await getSenders(req.user.userId);

    res.status(200).json({
      success: true,
      data: senders,
    });
  } catch (error) {
    next(error);
  }
};