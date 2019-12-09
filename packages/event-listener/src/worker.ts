import Queue from "bull";
import dotenv from "dotenv";
import { WsProvider, ApiPromise } from "@polkadot/api";
import {
  BlockHash,
  Header,
  EventRecord,
  BlockNumber
} from "@polkadot/types/interfaces";
import BN from "bn.js";
import { Vec } from "@polkadot/types";
import types from "./types";
import { JobData, EventObject } from "./interfaces";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import graphDb from "./graphDb";

// set environment variables
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

  const adapter = new FileSync("db.json", {
    defaultValue: { localLatestBlockNumber: "0" }
  });
  const db = low(adapter);

  // Event Filter List
  let filterList: string[];
  const SUBSTRATE_EVENT_SECTIONS = process.env.SUBSTRATE_EVENT_SECTIONS;
  if (!SUBSTRATE_EVENT_SECTIONS || SUBSTRATE_EVENT_SECTIONS == "all") {
    filterList = ["all"];
  } else {
    filterList = SUBSTRATE_EVENT_SECTIONS.split(",");
  }

  const localLatestBlockHeaderStr: string = db
    .get("localLatestBlockNumber")
    .value()
    .toString();
  let localLatestBlockNumber: BN = new BN(localLatestBlockHeaderStr);

  const one = new BN(1);

  syncQueue.process(async (job, done) => {
    console.log("/---- \n Job Data:", job.data);

    const { blockNumberStr }: JobData = job.data;

    const currentBlockNumber: BN = new BN(blockNumberStr);

    while (localLatestBlockNumber.lte(currentBlockNumber)) {
      console.log("Local Block Number", localLatestBlockNumber.toString(10));

      const localLatestBlockHash = await api.rpc.chain.getBlockHash(
        localLatestBlockNumber.toString(10)
      );

      // get events
      const events: Vec<EventRecord> = await api.query.system.events.at(
        localLatestBlockHash
      );
      events.forEach(async record => {
        // extract the phase, event and the event types
        const { event, phase } = record;
        const types = event.typeDef;

        // filter event section
        if (
          !(
            filterList.includes(event.section.toString()) ||
            filterList.includes("all")
          )
        ) {
          return;
        }

        // show what we are busy with
        // console.log(
        //   `\n${event.section}:${event.method}:: (phase=${phase.toString()})`
        // );
        // console.log(`\t${event.meta.documentation.toString()}`);
        // // log to events
        // event.data.forEach((parameter, index) => {
        //   console.log(`\t\t${types[index].type}: ${parameter.toString()}`);
        // });
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
      localLatestBlockNumber = localLatestBlockNumber.add(one);
      // update local block number
      db.set(
        "localLatestBlockNumber",
        localLatestBlockNumber.toString()
      ).write();
    }

    console.log("Done Job");
    done();
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
