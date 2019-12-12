import { EventObject, EventHandlers } from "../interfaces";
import neo4j from "../adaptors/neo4j";
import log from "./log";

const eventHandlers: EventHandlers = {
  content: {
    ContentPropertySet: neo4j.contentPropertySet,
    ContentCreated: neo4j.contentCreated
  },
  links: {
    LinkPropertySet: neo4j.linkPropertySet,
    ContentLinked: neo4j.contentLinked
  }
};

const db = {
  insertAsync: async (eventObject: EventObject): Promise<void> => {
    log.printStr(`Insert ${JSON.stringify(eventObject)} to DB`);

    const { section, method, data } = eventObject;

    if (eventHandlers[section] && eventHandlers[section][method]) {
      await eventHandlers[section][method](data);
    } else {
      log.printStr(`Cannot find event handler for ${section}:${method}`);
    }
  }
};

export default db;
