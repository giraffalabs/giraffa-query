import { Transaction, Result } from "neo4j-driver/types";

export function createContent(
  tx: Transaction,
  owner: string,
  cid: string
): Result {
  return tx.run(
    `CALL apoc.create.node(['Content'], {owner: $owner, cid: $cid })`,
    {
      owner,
      cid
    }
  );
}

export function setContentProperty(
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

export function setLinkProperty(
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

export function createLink(
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
