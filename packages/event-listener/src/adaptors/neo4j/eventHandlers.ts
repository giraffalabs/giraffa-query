import { EventData } from "@polkadot/types/primitive/Generic/Event";
import { newSession, closeSessionAsync } from "./session";
import {
  createContent,
  setContentProperty,
  setLinkProperty,
  createLink
} from "./statements";

export async function contentCreated(data: EventData): Promise<void> {
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

export async function contentPropertySet(data: EventData): Promise<void> {
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

export async function linkPropertySet(data: EventData): Promise<void> {
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

export async function contentLinked(data: EventData): Promise<void> {
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
