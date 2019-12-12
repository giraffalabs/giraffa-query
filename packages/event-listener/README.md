# @giraffa/event-listener

An event listener which utilizes a redis-based job queue to index data from a Giraffa node into a graph database (default: neo4j).

## Building

```bash
yarn build
```

## Running

```bash
yarn start:dep # start neo4j and redis
yarn clean # clean local storage, neo4j and redis

yarn start:listener # start event listener
yarn start:worker # start background worker
```

