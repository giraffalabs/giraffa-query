import { EventData } from "@polkadot/types/primitive/Generic/Event";

export interface JobData {
  blockNumberStr: string;
}

export interface EventObject {
  section: string;
  method: string;
  meta: string;
  data: EventData;
}

export interface EventHandlers {
  [key: string]: { [key: string]: (data: EventData) => Promise<void> };
}
