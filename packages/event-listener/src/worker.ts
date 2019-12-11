// types and interfaces
import { EventRecord } from "@polkadot/types/interfaces";
import { Vec } from "@polkadot/types";
import { JobData, EventObject } from "./interfaces";
import { ApiPromise } from "@polkadot/api";

// utils
import BN from "bn.js";
import graphDb from "./utils/graphDb";
import queue from "./utils/queue";
import { getApiAsync } from "./utils/api";
import { isFiltered } from "./utils/eventFilter";
import log from "./utils/log";
import localStorage from "./utils/localStorage";

// cli
import program from "commander";

// setup cli
program.version("0.1.0").option("-S, --silent", "Silent Mode");
program.parse(process.argv);

const one = new BN(1);

async function main(): Promise<void> {
  const api: ApiPromise = await getApiAsync();

  // get latest local block number
  const latestLocalBlockNumberStr: string = localStorage.getLatestLocalBlockNumberStr();
  let latestLocalBlockNumber: BN = new BN(latestLocalBlockNumberStr);

  queue.process(async jobData => {
    if (!program.silent) {
      log.printStr(`\n ---------- \nJob Data: ${JSON.stringify(jobData)}\n`);
    }

    const { blockNumberStr }: JobData = jobData;

    const currentBlockNumber: BN = new BN(blockNumberStr);

    while (latestLocalBlockNumber.lte(currentBlockNumber)) {
      if (!program.silent) {
        log.printStr(
          `Processing Block Number: ${latestLocalBlockNumber.toString(10)}`
        );
      }

      const localLatestBlockHash = await api.rpc.chain.getBlockHash(
        latestLocalBlockNumber.toString(10)
      );

      // get events
      const events: Vec<EventRecord> = await api.query.system.events.at(
        localLatestBlockHash
      );
      // process each event
      events.forEach(async eventRecord => {
        const { event } = eventRecord;

        // filter event section
        if (!isFiltered(event.section.toString())) {
          return;
        }

        // show what we are busy with
        if (!program.silent) {
          log.printEvent(eventRecord);
        }

        const eventObject: EventObject = {
          section: event.section,
          method: event.method,
          meta: event.meta.documentation.toString(),
          data: event.data
        };

        // insert into db
        await graphDb.insertAsync(eventObject);
      });

      // get next block hash
      latestLocalBlockNumber = latestLocalBlockNumber.add(one);
      // update local block number
      localStorage.setLatestLocalBlockNumberStr(
        latestLocalBlockNumber.toString()
      );
    }
    if (!program.silent) {
      log.printStr("Job Done");
    }
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
