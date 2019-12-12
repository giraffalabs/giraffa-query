import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import { Session, Driver } from "neo4j-driver/types";

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

export { newSession, closeSessionAsync };
