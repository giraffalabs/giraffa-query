import { ApiPromise, WsProvider } from "@polkadot/api";
import dotenv from "dotenv";
import { BlockHash, Header, EventRecord } from "@polkadot/types/interfaces";
import { Vec } from "@polkadot/types";
import BN from "bn.js";

dotenv.config();

// types for a giraffa node
const types = {
  ContentIdentifier: "Hash",
  LinkIdentifier: "u64",
  LinkType: "u32",
  PropertyKey: "u64",
  PropertyValue: {
    _enum: {
      Uint64: "u64",
      Char32: "[u8; 32]",
      Bool: "bool",
      Hash: "Hash",
      AccountId: "AccountId"
    }
  },
  Value: "PropertyValue"
};

async function main(): Promise<void> {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider(
    `ws://${process.env.SUBSTRATE_HOST}:${process.env.SUBSTRATE_PORT}`
  );

  const api = await ApiPromise.create({
    types,
    provider
  });

  // Event Filter List
  let filterList: string[];
  const SUBSTRATE_EVENT_SECTIONS = process.env.SUBSTRATE_EVENT_SECTIONS;
  if (!SUBSTRATE_EVENT_SECTIONS || SUBSTRATE_EVENT_SECTIONS == "all") {
    filterList = ["all"];
  } else {
    filterList = SUBSTRATE_EVENT_SECTIONS.split(",");
  }

  let localLatestBlockHash: BlockHash = api.genesisHash;
  const localLatestBlockHeader: Header = await api.rpc.chain.getHeader(
    localLatestBlockHash
  );
  let localLatestBlockNumber: BN = localLatestBlockHeader.number.toBn();

  const currentBlockHash: BlockHash = await api.rpc.chain.getFinalizedHead();
  // if no hash
  const one = new BN(1);

  while (!localLatestBlockHash.eq(currentBlockHash)) {
    console.log("Local Block Number", localLatestBlockNumber.toString(10));

    // get events
    const events: Vec<EventRecord> = await api.query.system.events.at(
      currentBlockHash
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
      console.log(
        `\n${event.section}:${event.method}:: (phase=${phase.toString()})`
      );
      console.log(`\t${event.meta.documentation.toString()}`);
      // log to events
      event.data.forEach((parameter, index) => {
        console.log(`\t\t${types[index].type}: ${parameter.toString()}`);
      });
    });
    // get next block hash
    localLatestBlockNumber = localLatestBlockNumber.add(one);
    localLatestBlockHash = await api.rpc.chain.getBlockHash(
      localLatestBlockNumber.toString(10)
    );
  }

  // let count = 0;
  // const unsubscribe = await api.rpc.chain.subscribeFinalizedHeads(header => {
  //   console.log(`Chain is at block: #${header.number}`);

  //   if (++count === 256) {
  //     unsubscribe();
  //     process.exit(0);
  //   }
  // });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
