import { ApiPromise, WsProvider } from "@polkadot/api";
import dotenv from "dotenv";

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

async function main() {
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

  api.query.system.events(async events => {
    // // loop through the Vec<EventRecord>
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
  });
}

main().catch(error => {
  console.error(error);
  process.exit(-1);
});
