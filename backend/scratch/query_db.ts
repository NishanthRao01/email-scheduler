import { prisma } from "../src/lib/prisma.ts";

async function main() {
  const email = await prisma.email.findUnique({
    where: { id: "cmtfk09dc0004b4o9yqmpjtz2" },
    include: {
      sender: true,
      campaign: true
    }
  });
  console.log("Email cmtfk09dc0004b4o9yqmpjtz2:", JSON.stringify(email, null, 2));
}

main().catch(console.error);
