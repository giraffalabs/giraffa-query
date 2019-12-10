# @giraffa/event-listener

An event listener which utilizes a redis-based job queue to index data from a Giraffa node into a graph database.

### Building

```
yarn build
```

### Running

```
redis-server # start redis server
yarn start:listener # start event listener
yarn start:worker # start background worker
```

