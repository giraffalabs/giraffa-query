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

const one = new BN(1);

async function main(): Promise<void> {
  const api: ApiPromise = await getApiAsync();

  // get latest local block number
  const latestLocalBlockNumberStr: string = localStorage.getLatestLocalBlockNumberStr();
  let latestLocalBlockNumber: BN = new BN(latestLocalBlockNumberStr);

  queue.process(async jobData => {
    log.printStr(`\n -------------- \nJob Data: ${JSON.stringify(jobData)}\n`);

    const { blockNumberStr }: JobData = jobData;

    const currentBlockNumber: BN = new BN(blockNumberStr);

    while (latestLocalBlockNumber.lte(currentBlockNumber)) {
      log.printStr(
        `Processing Block Number: ${latestLocalBlockNumber.toString(10)}`
      );

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
        log.printEvent(eventRecord);

        const eventObject: EventObject = {
          section: event.section,
          method: event.method,
          meta: event.meta.documentation.toString(),
          data: event.data.toString()
        };

        // insert into db
        graphDb.insert(eventObject);
      });

      // get next block hash
      latestLocalBlockNumber = latestLocalBlockNumber.add(one);
      // update local block number
      localStorage.setLatestLocalBlockNumberStr(
        latestLocalBlockNumber.toString()
      );
    }

    log.printStr("Job Done");
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
