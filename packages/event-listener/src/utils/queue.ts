import dotenv from "dotenv";
import Queue from "bull";
import { JobData } from "../interfaces";

dotenv.config();

const REDIS_URL: string = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : "redis://127.0.0.1:6379";

const syncQueue = new Queue<JobData>("sync", REDIS_URL);

export default {
  getSyncQueue: (): Queue.Queue<JobData> => {
    return syncQueue;
  },
  add: (jobData: JobData): void => {
    syncQueue.add(jobData);
  },
  process: (handler: (_jobData: JobData) => Promise<void>): void => {
    syncQueue.process(async job => {
      const jobData: JobData = job.data;

      try {
        await handler(jobData);
      } catch (e) {
        throw new Error(e);
      }
      return Promise.resolve({ latestBlockNumberStr: jobData.blockNumberStr });
    });
  }
};
