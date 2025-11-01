const { fetchRow } = require("../utils/dbUtils");
const { getCachedConfig, saveCachedConfig } = require("./cacheHelpers");

const debug = require("./debug");

async function initCacheOnStartup() {
  try {
    const cached = getCachedConfig();
    if (cached && cached.title && cached.color) {
      debug.log("Cache already loaded");
      return;
    }

    debug.log("Building cache from database...");

    const row = await fetchRow(`
      SELECT "topTitle", "bottomTitle", "headerColor", "contentColor"
      FROM general
      WHERE id = 1
      `);
    if (!row) {
      debug.warn("No general config found in DB");
      return;
    }

    const data = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
    };

    saveCachedConfig(data);
    debug.log("General configuration cache built successfully");
  } catch (err) {
    console.error("Failed to initialize cache:", err);
  }
}

module.exports = { initCacheOnStartup };
