import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import { Session, Driver, Transaction, Result } from "neo4j-driver/types";
import { EventData } from "@polkadot/types/primitive/Generic/Event";

dotenv.config();

const {
  NEO4J_URI = "neo4j://localhost",
  NEO4J_USER = "neo4j",
  NEO4J_PASS = "neo4j",
  NEO4J_DB = "giraffa"
} = process.env;

const driver: Driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASS)
);

function newSession(): Session {
  return driver.session({
    database: NEO4J_DB,
    defaultAccessMode: neo4j.session.WRITE
  });
}

async function closeSessionAsync(session: Session): Promise<void> {
  await session.close();
}

function setContentProperty(
  tx: Transaction,
  key: string,
  value: string
): Result {
  return tx.run("CREATE (a:Node {key: $key, value:$value})", { key, value });
}

function setLinkProperty(tx: Transaction, key: string, value: string): Result {
  return tx.run("CREATE (a:Link {key: $key, value:$value})", { key, value });
}

async function contentPropertySet(data: EventData): Promise<void> {
  const key = data[0].toString();
  const value = data[1].toString();

  const session = newSession();
  const tx = session.beginTransaction();
  try {
    const result = await setContentProperty(tx, key, value);
    console.log(JSON.stringify(result));

    await tx.commit();
    console.log("committed");
  } catch (error) {
    console.log(error);
    await tx.rollback();
    console.log("rolled back");
  } finally {
    await closeSessionAsync(session);
  }
}

async function linkPropertySet(data: EventData): Promise<void> {
  const key = data[0].toString();
  const value = data[1].toString();

  const session = newSession();

  const tx = session.beginTransaction();
  try {
    const result = await setLinkProperty(tx, key, value);
    console.log(JSON.stringify(result));

    await tx.commit();
    console.log("committed");
  } catch (error) {
    console.log(error);
    await tx.rollback();
    console.log("rolled back");
  } finally {
    await closeSessionAsync(session);
  }
}

export default {
  contentPropertySet,
  linkPropertySet
};
