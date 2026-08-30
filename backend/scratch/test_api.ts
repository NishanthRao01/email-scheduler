import { prisma } from "../src/lib/prisma.ts";
import jwt from "jsonwebtoken";

async function main() {
  // Find any email in the database to see who owns it
  const anyEmail = await prisma.email.findFirst({
    include: {
      campaign: true
    }
  });

  if (!anyEmail) {
    console.log("No emails exist in database.");
    return;
  }

  const userId = anyEmail.campaign.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.log("User not found for email:", userId);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "change-this-to-a-long-random-secret-nishanth";
  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret);

  console.log("Fetching scheduled emails for user:", user.email);
  try {
    const res = await fetch("http://localhost:5000/api/emails/scheduled", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    console.log("API Scheduled Response JSON:", JSON.stringify(json, null, 2));

    const resSent = await fetch("http://localhost:5000/api/emails/sent", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const jsonSent = await resSent.json();
    console.log("API Sent Response JSON:", JSON.stringify(jsonSent, null, 2));
  } catch (err) {
    console.error("HTTP Fetch failed:", err);
  }
}

main().catch(console.error);
