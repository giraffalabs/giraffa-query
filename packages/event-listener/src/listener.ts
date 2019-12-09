// types and interfaces
import { JobData } from "./interfaces";

// utils
import queue from "./utils/queue";
import { getApiAsync } from "./utils/api";
import log from "./utils/log";

async function main(): Promise<void> {
  const api = await getApiAsync();

  const unsubscribe = await api.rpc.chain.subscribeFinalizedHeads(header => {
    log.printStr(`Chain is at block: #${header.number}`);

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
