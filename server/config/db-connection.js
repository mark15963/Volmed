const { Pool } = require("pg");
const debug = require("../utils/debug");

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 1000 * 10,
  idleTimeoutMillis: 1000 * 30,
  max: 20,
  allowExitOnIdle: true,
};

const db = new Pool(dbConfig);

// DB connection test
async function testDbConnection() {
  const retries = 5;
  const delay = 2000;

  debug.log(`Connecting to database in ${process.env.NODE_ENV} mode...`);
  debug.log(`Database: ${process.env.DB_NAME}`);
  debug.log(`SSL: ${dbConfig.ssl ? "enabled" : "disabled"}`);

  for (let i = 1; i <= retries; i++) {
    let client;
    try {
      client = await db.connect();
      const result = await client.query(
        "SELECT version(), current_database(), current_user",
      );
      debug.log("✅ Database connected successfully!");
      debug.log("   Version:", result.rows[0].version);
      debug.log("   Database:", result.rows[0].current_database);
      debug.log("   User:", result.rows[0].current_user);
      client.release();
      return;
    } catch (err) {
      debug.error(`Attempt ${i} failed:`, err.message);
      if (client) client.release();
      if (i < retries) {
        debug.log(`Retrying in ${(delay * i) / 1000} seconds...`);
        await new Promise((r) => setTimeout(r, delay * i));
      }
    }
  }
  throw new Error("Maximum DB connection attempts reached");
}

//-----DATABASE DEBUG-----
function setupPoolEvents(pool) {
  // pool.on("connect", () => {
  //   debug.log("New database connection established");
  // });
  // pool.on("acquire", (client) => {
  //   debug.log(`Client acquired. Pool status:
  //       Process ID: ${client.processID}
  //       Active clients: ${pool.totalCount - pool.idleCount}/${pool.totalCount}
  //       Server: ${client.connection.stream.remoteAddress}`);
  // });
  // pool.on("release", () => {
  //   debug.log(`Client released. Idle: ${pool.idleCount}/${pool.totalCount}`);
  // });
  // pool.on("remove", () => {
  //   debug.log("Connection permanently removed from pool");
  // });
  pool.on("error", (err) => {
    debug.error("Pool error:", err);
  });
}
setupPoolEvents(db);

module.exports = {
  db,
  testDbConnection,
};
