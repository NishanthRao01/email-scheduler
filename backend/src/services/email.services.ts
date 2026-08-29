import { prisma } from "../lib/prisma.ts";
import type { ScheduleEmailInput } from "../validators/email.validator.ts";
import { AppError } from "../utils/errors.ts";

export const scheduleEmails = async (
  input: ScheduleEmailInput,
) => {
  const sender = await prisma.sender.findFirst({
    where: {
      id: input.senderId,
      userId: input.userId,
    },
  });

  if (!sender) {
    throw new AppError("Sender not found", 404);
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: input.userId,
      subject: input.subject,
      body: input.body,
      startTime: new Date(input.startTime),
      delayBetweenEmails: input.delayBetweenEmails,
      hourlyLimit: input.hourlyLimit,
      emails: {
        create: input.recipients.map((recipient, index) => ({
          senderId: input.senderId,
          recipient,
          subject: input.subject,
          body: input.body,
          scheduledAt: new Date(
            new Date(input.startTime).getTime() +
              index * input.delayBetweenEmails,
          ),
        })),
      },
    },
    include: {
      emails: true,
    },
  });

  return campaign;
};