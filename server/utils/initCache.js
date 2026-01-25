const { fetchRow } = require("../utils/dbUtils");
const { getCacheConfig, setCacheConfig } = require("./cache.ts");
const debug = require("./debug");

async function initCacheOnStartup() {
  try {
    const cached = await getCacheConfig();
    if (cached) {
      console.log("Cache already loaded");
      return;
    }

    console.log("Building cache from database...");

    const row = await fetchRow(`
      SELECT *
      FROM general
      WHERE id = 1
      `);
    if (!row) {
      console.warn("No general config found in DB");
      return;
    }

    const data = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      logoUrl: row.logoUrl,
      theme: row.theme,
    };
    debug.log(data)

    await setCacheConfig(data);
    console.log("General configuration cache built successfully");
  } catch (err) {
    console.error("Failed to initialize cache:", err);
  }
}

module.exports = { initCacheOnStartup };
