const dotenv = require("dotenv");
const neo4j = require("neo4j-driver");

dotenv.config();

const {
  NEO4J_URI = "bolt://127.0.0.1:7687",
  NEO4J_USER = "neo4j",
  NEO4J_PASS = "neo4j",
  NEO4J_DB = "graph.db"
} = process.env;

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASS)
);

const session = driver.session({
  // database: NEO4J_DB,
  defaultAccessMode: neo4j.session.WRITE
});

session.run("MATCH (n) DETACH DELETE n").then(() => {
  session.close();
  driver.close();
});
