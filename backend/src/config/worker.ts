import "dotenv/config";

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 5);

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error("WORKER_CONCURRENCY must be a positive integer");
}

export const workerConfig = {
  concurrency,
};