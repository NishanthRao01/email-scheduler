import { prisma } from "../lib/prisma.ts";
import type { ScheduleEmailInput } from "../validators/email.validator.ts";
import { scheduleEmailJob } from "./email.scheduler.service.ts";
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

for (const email of campaign.emails) {
  await scheduleEmailJob({
    emailId: email.id,
    scheduledAt: email.scheduledAt,
  });
}

  return campaign;
};


export const getScheduledEmails = async (userId: string) => {
  return prisma.email.findMany({
    where: {
      campaign: {
        userId,
      },
      status: "PENDING",
    },
    select: {
      id: true,
      recipient: true,
      subject: true,
      body: true,
      scheduledAt: true,
      status: true,
      sender: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

export const getSentEmails = async (userId: string) => {
  return prisma.email.findMany({
    where: {
      campaign: {
        userId,
      },
      status: {
        in: ["SENT", "FAILED"],
      },
    },
    select: {
      id: true,
      recipient: true,
      subject: true,
      body: true,
      sentAt: true,
      status: true,
      sender: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      sentAt: "desc",
    },
  });
};

export const getSenders = async (userId: string) => {
  return prisma.sender.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      email: "asc",
    },
  });
};