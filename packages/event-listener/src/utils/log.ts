import { EventRecord } from "@polkadot/types/interfaces";

export default {
  printEvent: (eventRecord: EventRecord): void => {
    const { event, phase } = eventRecord;
    const types = event.typeDef;

    // show what we are busy with
    console.log(
      `\n${event.section}:${event.method}:: (phase=${phase.toString()})`
    );
    console.log(`\t${event.meta.documentation.toString()}`);
    // log to events
    event.data.forEach((parameter, index) => {
      console.log(`\t\t${types[index].type}: ${parameter.toString()}`);
    });
  },
  printStr: (str: string): void => {
    console.log(str);
  }
};
