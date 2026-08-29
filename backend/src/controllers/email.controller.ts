import type { RequestHandler } from "express";

import { scheduleEmails } from "../services/email.services.ts";
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