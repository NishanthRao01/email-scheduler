/// <reference types="node" />

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const seed = async () => {
  const user = await prisma.user.upsert({
    where: {
      email: "dev@example.com",
    },
    update: {},
    create: {
      email: "dev@example.com",
      name: "Development User",
      avatarUrl: null,
    },
  });

  const sender = await prisma.sender.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: "sender@example.com",
      },
    },
    update: {},
    create: {
      userId: user.id,
      email: "sender@example.com",
      name: "Development Sender",
    },
  });

  console.log("Seed completed");
  console.log("User ID:", user.id);
  console.log("Sender ID:", sender.id);
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });