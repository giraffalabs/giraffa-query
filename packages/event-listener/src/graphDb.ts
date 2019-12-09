import { EventObject } from "./interfaces";

const db = {
  insert: (data: EventObject): void => {
    console.log(`Insert ${data.toString()} to DB`);
  }
};

export default db;
