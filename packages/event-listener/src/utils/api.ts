import dotenv from "dotenv";
import { ApiPromise, WsProvider } from "@polkadot/api";
import giraffaTypes from "../giraffaTypes";

dotenv.config();

// Initialise the provider to connect to the local node
const provider = new WsProvider(
  `ws://${process.env.SUBSTRATE_HOST}:${process.env.SUBSTRATE_PORT}`
);

const apiPromise = ApiPromise.create({
  types: giraffaTypes,
  provider
});

export const getApiAsync = (): Promise<ApiPromise> => {
  return apiPromise;
};
