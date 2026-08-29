import { prisma } from "../lib/prisma.ts";
import { scheduleEmailJob } from "./email.scheduler.service.ts";

export const reconcilePendingEmails = async () => {
  const emails = await prisma.email.findMany({
    where: {
      status: "PENDING",
    },
    select: {
      id: true,
      scheduledAt: true,
    },
  });

  for (const email of emails) {
    await scheduleEmailJob({
      emailId: email.id,
      scheduledAt: email.scheduledAt,
    });
  }

  console.log(`Reconciled ${emails.length} pending emails`);
};