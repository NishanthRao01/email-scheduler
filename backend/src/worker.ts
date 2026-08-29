import "./workers/email.worker.ts";

import { reconcilePendingEmails } from "./services/email.reconciliation.service.ts";

const startWorker = async () => {
  await reconcilePendingEmails();

  console.log("Email worker process started");
};

startWorker().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});