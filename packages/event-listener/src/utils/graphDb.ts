import { EventObject } from "../interfaces";

const db = {
  insert: (data: EventObject): void => {
    console.log(`Insert ${JSON.stringify(data)} to DB`);
  }
};

export default db;
