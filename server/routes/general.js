const { Router } = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  getCacheConfig,
  setCacheConfig,
  clearCache,
} = require("../utils/cache.ts");
const { updateRow, fetchRow } = require("../utils/dbUtils");
const debug = require("../utils/debug");

const router = Router();

router.get("/config", async (req, res) => {
  try {
    // Get data from cache
    let config = await getCacheConfig();
    if (config) {
      debug.log("Config served from cache");
      return res.json(config);
    }

    // fetch from DB
    debug.log("Cache missing - Fetching from DB");
    const row = await fetchRow(`
      SELECT *
      FROM general 
      WHERE id = 1
    `);

    if (!row) {
      return res.status(404).json({ error: "Config not found in DB" });
    }

    // Build full config obj
    config = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      theme: row.theme,
      logoUrl: row.logoUrl,
    };

    // Save to cache for next time
    await setCacheConfig(config);
    debug.success("Config fetched from DB and cached");

    res.json(config);
  } catch (err) {
    console.error("Error fetching config:", err);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});
// Update DB -> update cache
router.put("/config", async (req, res) => {
  const { title, headerColor, contentColor, containerColor, logoUrl, theme } =
    req.body;

  // No fields provided
  if (
    title === undefined &&
    headerColor === undefined &&
    contentColor === undefined &&
    containerColor === undefined &&
    theme === undefined
  ) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  try {
    const setParts = [];
    let paramValues = [];

    if (title !== undefined) {
      setParts.push(`title = $${setParts.length + 1}`);
      paramValues.push(title);
    }

    if (headerColor !== undefined) {
      setParts.push(`"headerColor" = $${setParts.length + 1}`);
      paramValues.push(headerColor);
    }

    if (contentColor !== undefined) {
      setParts.push(`"contentColor" = $${setParts.length + 1}`);
      paramValues.push(contentColor);
    }

    if (containerColor !== undefined) {
      setParts.push(`"containerColor" = $${setParts.length + 1}`);
      paramValues.push(containerColor);
    }

    if (logoUrl !== undefined) {
      setParts.push(`"logoUrl" = $${setParts.length + 1}`);
      paramValues.push(logoUrl);
    }

    if (theme !== undefined) {
      setParts.push(`theme = $${setParts.length + 1}`);
      paramValues.push(theme);
    }

    // Safety check (should not happen due to earlier validation)
    if (setParts.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const query = `
      UPDATE general
      SET ${setParts.join(", ")}
      WHERE id = 1
      RETURNING *
    `;

    const row = await updateRow(query, paramValues);

    if (!row) return res.status(404).json({ error: "Config record not found" });

    const updatedConfig = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      logoUrl: row.logoUrl,
      theme: row.theme,
    };

    await setCacheConfig(updatedConfig);

    debug.success("Config updated in DB and cache:", updatedConfig);

    res.json(updatedConfig);
  } catch (err) {
    console.error("Error updating config:", err);
    res.status(500).json({ error: "Failed to update config" });
  }
});

//#region ===== Logo configs =====
// Define permanent upload location (client's public assets folder)
const publicDir = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "public",
  "assets",
  "images",
);
const srcDir = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "src",
  "assets",
  "images",
);

// Ensure directories exist
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(srcDir, { recursive: true });

// Configure multer to save directly there
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".webp";
    // remove any old logo.* file
    fs.readdirSync(publicDir).forEach(
      (f) => f.startsWith("logo.") && fs.unlinkSync(path.join(publicDir, f)),
    );

    cb(null, "logo" + ext);
  },
});

const upload = multer({ storage });

//#region ===== Logo routes =====
router.post("/upload-logo", upload.single("logo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const srcPath = path.join(srcDir, req.file.filename);
  fs.copyFileSync(path.join(publicDir, req.file.filename), srcPath);

  // Return the public URL that the frontend can use
  const logoUrl = `/assets/images/${req.file.filename}?t=${Date.now()}`;

  const current = await getCacheConfig();
  if (current) {
    await setCacheConfig({
      ...current,
      logoUrl,
    });
  }

  res.json({ logoUrl });
});
// ---- Get Logo ----
router.get("/get-logo", (req, res) => {
  try {
    // Look for an existing logo file in the assets folder
    const files = fs.readdirSync(publicDir);
    const logo = files.find((f) => f.startsWith("logo."));

    res.json({
      logoUrl: logo ? `/assets/images/${logo}?t=${Date.now()}` : null,
    });
  } catch (err) {
    console.error("Failed to get logo:", err);
    res.status(500).json({ error: "Failed to get logo" });
  }
});
//#endregion
//#endregion

module.exports = router;
