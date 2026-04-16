❯ clear
❯ pnpm run seed:admin

> plugng-backend@1.0.0 seed:admin /Users/harz/Documents/backUps/tripcarry/plugng-shop/backend
> ts-node scripts/seedAdmin.ts

Failed to seed admin user: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
    at _handleConnectionErrors (/Users/harz/Documents/backUps/tripcarry/plugng-shop/backend/node_modules/.pnpm/mongoose@8.21.1_socks@2.8.7/node_modules/mongoose/lib/connection.js:1169:11)
    at NativeConnection.openUri (/Users/harz/Documents/backUps/tripcarry/plugng-shop/backend/node_modules/.pnpm/mongoose@8.21.1_socks@2.8.7/node_modules/mongoose/lib/connection.js:1100:11)
    at async seedAdmin (/Users/harz/Documents/backUps/tripcarry/plugng-shop/backend/scripts/seedAdmin.ts:27:5) {
  errorLabelSet: Set(0) {},
  reason: TopologyDescription {
    type: 'ReplicaSetNoPrimary',
    servers: Map(3) {
      'ac-pdicdvr-shard-00-01.jym9bdk.mongodb.net:27017' => [ServerDescription],
      'ac-pdicdvr-shard-00-00.jym9bdk.mongodb.net:27017' => [ServerDescription],
      'ac-pdicdvr-shard-00-02.jym9bdk.mongodb.net:27017' => [ServerDescription]
    },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: 'atlas-10dc3v-shard-0',
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  },
  code: undefined,
  cause: TopologyDescription {
    type: 'ReplicaSetNoPrimary',
    servers: Map(3) {
      'ac-pdicdvr-shard-00-01.jym9bdk.mongodb.net:27017' => [ServerDescription],
      'ac-pdicdvr-shard-00-00.jym9bdk.mongodb.net:27017' => [ServerDescription],
      'ac-pdicdvr-shard-00-02.jym9bdk.mongodb.net:27017' => [ServerDescription]
    },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: 'atlas-10dc3v-shard-0',
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  }
}
 ELIFECYCLE  Command failed with exit code 1.

  ~/Doc/b/tripcarry/plugng-shop/backend   main !1 ?1 ❯                               37s  system  16:07:16