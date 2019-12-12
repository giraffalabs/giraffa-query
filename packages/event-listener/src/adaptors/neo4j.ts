import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import { Session, Driver, Transaction, Result } from "neo4j-driver/types";
import { EventData } from "@polkadot/types/primitive/Generic/Event";
import { PropertyKeyValue } from "../constants";

dotenv.config();

const {
  NEO4J_URI = "neo4j://localhost",
  NEO4J_USER = "neo4j",
  NEO4J_PASS = "neo4j",
  NEO4J_DB = "graph.db"
} = process.env;

const driver: Driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASS)
);

function newSession(): Session {
  return driver.session({
    // database: NEO4J_DB,
    defaultAccessMode: neo4j.session.WRITE
  });
}

async function closeSessionAsync(session: Session): Promise<void> {
  await session.close();
}

function createContent(tx: Transaction, owner: string, cid: string): Result {
  return tx.run(
    `CALL apoc.create.node(['Content'], {owner: $owner, cid: $cid })`,
    {
      owner,
      cid
    }
  );
}

function setContentProperty(
  tx: Transaction,
  cid: string,
  key: string,
  value: string
): Result {
  return tx.run(
    `
  MATCH (n:Content)
  WHERE n.cid = $cid
  CALL apoc.create.setProperty(n, $key, $value) YIELD node
  return node
    `,
    { cid, key: "p" + key, value }
  );
}

// MATCH (a: Content)
// WHERE id(a) = 203
// CALL apoc.create.setProperty(a, "tset4444","hi") YIELD node
// return node

// CALL apoc.create.setRelProperty(260, "test", "yo")

function setLinkProperty(
  tx: Transaction,
  lid: string,
  key: string,
  value: string
): Result {
  return tx.run(
    `
  MATCH (a: Content)-[r: Link]->(b: Content)
  WHERE r.lid = $lid
  CALL apoc.create.setRelProperty(r, $key, $value) YIELD rel
  return rel
    `,
    { lid, key: "p" + key, value }
  );
}

function createLink(
  tx: Transaction,
  lid: string,
  from: string,
  to: string,
  linkType: string
): Result {
  return tx.run(
    `
    MATCH (a:Content {cid: $from}),(b:Content {cid: $to})
    MERGE (a)-[r: Link {lid: $lid, linkType: $linkType}]->(b)
    `,
    {
      lid,
      from,
      to,
      linkType
    }
  );
}

async function contentPropertySet(data: EventData): Promise<void> {
  // const accountId = data[0].toString();
  const cid = data[1].toString();
  const key = data[2].toString();
  const value = data[3].toString();

  const session = newSession();
  const tx = session.beginTransaction();
  try {
    const result = await setContentProperty(tx, cid, key, value);
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
  // const accountId = data[0].toString();
  const lid = data[1].toString();
  const key = data[2].toString();
  const value = data[3].toString();

  const session = newSession();

  const tx = session.beginTransaction();
  try {
    const result = await setLinkProperty(tx, lid, key, value);
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

async function contentLinked(data: EventData): Promise<void> {
  // const accountId = data[0].toString();
  const lid = data[1].toString();
  const from = data[2].toString();
  const to = data[3].toString();
  const linkType = data[4].toString();

  const session = newSession();

  const tx = session.beginTransaction();
  try {
    const result = await createLink(tx, lid, from, to, linkType);
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

async function contentCreated(data: EventData): Promise<void> {
  const accountId = data[0].toString();
  const cid = data[1].toString();

  const session = newSession();

  const tx = session.beginTransaction();
  try {
    const result = await createContent(tx, accountId, cid);
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
  linkPropertySet,
  contentLinked,
  contentCreated
};
