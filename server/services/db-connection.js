const { Pool } = require("pg");
const debug = require("../utils/debug");
const fs = require("fs");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca:
      process.env.NODE_ENV === "production"
        ? fs.readFileSync("/etc/ssl/certs/ca-certificates.crt").toString()
        : undefined,
  },
  connectionTimeoutMillis: 1000 * 10,
  idleTimeoutMillis: 1000 * 30,
  max: 20,
  allowExitOnIdle: true,
});

// DB connection test
async function testDbConnection() {
  const retries = 5;
  const delay = 2000;

  for (let i = 1; i <= retries; i++) {
    let client;
    try {
      client = await db.connect();
      const result = await client.query("SELECT version()");
      debug.log("Database version:", result.rows[0].version);
      client.release();
      return;
    } catch (err) {
      debug.error(`Attempt ${i} failed:`, err.message);
      if (client) client.release();
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delay * i));
      }
    }
  }
  throw new Error("Maximum DB connection attempts reached");
}

//-----DATABASE DEBUG-----
// function setupPoolEvents(pool) {
//   pool.on("connect", () => {
//     debug.log("New database connection established");
//   });
//   pool.on("acquire", (client) => {
//     debug.log(`Client acquired. Pool status:
//         Process ID: ${client.processID}
//         Active clients: ${pool.totalCount - pool.idleCount}/${pool.totalCount}
//         Server: ${client.connection.stream.remoteAddress}`);
//   });
//   pool.on("release", () => {
//     debug.log(`Client released. Idle: ${pool.idleCount}/${pool.totalCount}`);
//   });
//   pool.on("remove", () => {
//     debug.log("Connection permanently removed from pool");
//   });
//   pool.on("error", (err) => {
//     debug.error("Pool error:", err);
//   });
// }
// setupPoolEvents(db);

module.exports = {
  db,
  testDbConnection,
};
