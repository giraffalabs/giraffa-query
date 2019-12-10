import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

const adapter = new FileSync("db.json", {
  defaultValue: { localLatestBlockNumber: "0" }
});
const db = low(adapter);

export default {
  getLatestLocalBlockNumberStr: (): string => {
    const latestLocalBlockNumberStr = db
      .get("localLatestBlockNumber")
      .value()
      .toString();

    return latestLocalBlockNumberStr;
  },
  setLatestLocalBlockNumberStr: (latestLocalBlockNumberStr: string): void => {
    db.set("localLatestBlockNumber", latestLocalBlockNumberStr).write();
  }
};
