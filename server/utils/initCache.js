const { fetchRow } = require("../utils/dbUtils");
const { getCachedConfig, saveCachedConfig } = require("./cacheHelpers");

const debug = require("./debug");

async function initCacheOnStartup() {
  try {
    const cached = getCachedConfig();
    if (
      cached &&
      cached.title &&
      cached.color &&
      cached.theme &&
      cached.logoUrl
    ) {
      console.log("Cache already loaded");
      return;
    }

    console.log("Building cache from database...");

    const row = await fetchRow(`
      SELECT "title", "headerColor", "contentColor", "containerColor", "theme","logoUrl"
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
      logo: row.logoUrl,
      theme: row.theme,
    };

    saveCachedConfig(data);
    console.log("General configuration cache built successfully");
  } catch (err) {
    console.error("Failed to initialize cache:", err);
  }
}

module.exports = { initCacheOnStartup };
