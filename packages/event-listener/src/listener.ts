// !important: set environment variables
import dotenv from "dotenv";
dotenv.config();

// types and interfaces
import { JobData } from "./interfaces";

// utils
import queue from "./utils/queue";
import { getApiAsync } from "./utils/api";
import log from "./utils/log";

// cli
import program from "commander";

// setup cli
program.version("0.1.0").option("-S, --silent", "Silent Mode");
program.parse(process.argv);

// main function
async function main(): Promise<void> {
  const api = await getApiAsync();

  const unsubscribe = await api.rpc.chain.subscribeFinalizedHeads(header => {
    if (!program.silent) {
      log.printStr(`Chain is at block: #${header.number}`);
    }

    const jobData: JobData = {
      blockNumberStr: header.number.toString()
    };
    queue.add(jobData);
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
