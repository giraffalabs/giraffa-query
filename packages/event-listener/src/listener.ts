import { ApiPromise, WsProvider } from "@polkadot/api";
import dotenv from "dotenv";
import Queue from "bull";
import types from "./types";
import { JobData } from "./interfaces";

dotenv.config();

const REDIS_URL: string = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : "redis://127.0.0.1:6379";

const syncQueue = new Queue("sync", REDIS_URL);

async function main(): Promise<void> {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider(
    `ws://${process.env.SUBSTRATE_HOST}:${process.env.SUBSTRATE_PORT}`
  );

  const api = await ApiPromise.create({
    types,
    provider
  });

  const unsubscribe = await api.rpc.chain.subscribeFinalizedHeads(header => {
    console.log(`Chain is at block: #${header.number}`);
    const jobData: JobData = {
      blockNumberStr: header.number.toString()
    };
    syncQueue.add(jobData);
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
