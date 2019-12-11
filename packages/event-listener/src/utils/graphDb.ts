import { EventObject, EventHandlers } from "../interfaces";
import neo4j from "../adaptors/neo4j";

const eventHandlers: EventHandlers = {
  content: {
    ContentPropertySet: neo4j.contentPropertySet
  },
  links: {
    LinkPropertySet: neo4j.linkPropertySet
  }
};

const db = {
  insertAsync: async (eventObject: EventObject): Promise<void> => {
    console.log(`Insert ${JSON.stringify(eventObject)} to DB`);

    const { section, method, data } = eventObject;

    await eventHandlers[section][method](data);
  }
};

export default db;
