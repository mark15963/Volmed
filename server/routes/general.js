const { Router } = require("express");
const { db } = require("../config/db-connection");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getCachedConfig, saveCachedConfig } = require("../utils/cacheHelpers");
const { updateRow, fetchRow } = require("../utils/dbUtils");
const debug = require("../utils/debug");

const router = Router();

//#region ===== Title routes =====
router.get("/title", async (req, res) => {
  try {
    const cached = getCachedConfig();
    if (cached?.title) {
      return res.json({ title: cached.title });
    }

    const row = await fetchRow('SELECT "title" FROM general WHERE id = 1');
    if (!row) return res.status(404).json({ error: "Data not found" });

    const title = row.title;
    saveCachedConfig({ title });

    res.json({ title });
  } catch (err) {
    console.error("Error fetching title:", err);
    res.status(500).json({ error: "Failed to fetch title" });
  }
});
router.put("/title", async (req, res) => {
  debug.log("📝 Raw headers:", req.headers);
  debug.log("📝 Raw body type:", typeof req.body, req.body);

  if (!req.body || !req.body.title) {
    debug.error("❌ Missing title in request body!");
    return res.status(400).json({ error: "Missing title in request body" });
  }

  const { title } = req.body;

  debug.log("📝 Received title update:", { title });
  debug.log("📝 Request body:", req.body);

  try {
    const row = await updateRow(
      `UPDATE general SET "title" = $1 WHERE id = 1 RETURNING *`,
      [{ value: title }],
      [{ index: 0, name: "Title" }], // Required
    );
    if (!row) return res.status(404).json({ error: "Record not found" });

    saveCachedConfig({ title: row.title });

    res.json({ title: row.title });
  } catch (err) {
    console.error("Error updating title:", err);
    res.status(500).json({ error: "Failed to update title" });
  }
});
//#endregion
//#region ===== Color routes =====
router.get("/color", async (req, res) => {
  try {
    const cached = getCachedConfig();
    if (cached?.color) {
      return res.json(cached.color);
    }
    const row = await fetchRow(`
      SELECT "headerColor", "contentColor", "containerColor" 
      FROM general 
      WHERE id = 1
    `);

    if (!row) return res.status(404).json({ error: "Data not found" });

    const color = {
      headerColor: row.headerColor,
      contentColor: row.contentColor,
      containerColor: row.containerColor,
    };
    saveCachedConfig({ color });

    res.json(color);
  } catch (err) {
    console.error("Error fetching color:", err);
    res.status(500).json({ error: "Failed to fetch color" });
  }
});
router.put("/color", async (req, res) => {
  const {
    headerColor = req.body.header,
    contentColor = req.body.content,
    containerColor = req.body.container,
  } = req.body;

  debug.log("🎨 Received color update:", {
    headerColor,
    contentColor,
    containerColor,
  });
  debug.log("🎨 Request body:", req.body);

  try {
    const row = await updateRow(
      `
      UPDATE general 
      SET "headerColor" = $1, "contentColor" = $2, "containerColor" = $3 
      WHERE id = 1 
      RETURNING *
      `,
      [
        { value: headerColor },
        { value: contentColor },
        { value: containerColor },
      ],
      [
        { index: 0, name: "Header color" }, // Required
        { index: 1, name: "Content color" }, // Required
        { index: 2, name: "Container color" }, // Required
      ],
    );
    if (!row) return res.status(404).json({ error: "Record not found" });

    const color = {
      headerColor: row.headerColor,
      contentColor: row.contentColor,
      containerColor: row.containerColor,
    };
    saveCachedConfig({ color });

    res.json(color);
  } catch (err) {
    console.error("Error updating color:", err);
    res.status(500).json({ error: "Failed to update color" });
  }
});
//#endregion
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
router.post("/upload-logo", upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const srcPath = path.join(srcDir, req.file.filename);
  fs.copyFileSync(path.join(publicDir, req.file.filename), srcPath);

  // Return the public URL that the frontend can use
  const logoUrl = `/assets/images/${req.file.filename}?t=${Date.now()}`;
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
//#region ===== Theme routes =====
router.get("/theme", async (req, res) => {
  try {
    // const cached = getCachedConfig();
    // if (cached?.theme) {
    //   return res.json({ theme: cached.theme });
    // }

    const row = await fetchRow("SELECT theme FROM general WHERE id = 1");
    if (!row) return res.status(404).json({ error: "Data not found" });

    const theme = row.theme;
    // saveCachedConfig({ theme });

    res.json({ theme });
  } catch (err) {
    console.error("Error fetching theme:", err);
    res.status(500).json({ error: "Failed to fetch theme" });
  }
});
router.put("/theme", async (req, res) => {
  debug.log("📝 Raw headers:", req.headers);
  debug.log("📝 Raw body type:", typeof req.body, req.body);

  if (!req.body || !req.body?.theme) {
    debug.error("❌ Missing theme in request body!");
    return res.status(400).json({ error: "Missing theme in request body" });
  }

  const { theme } = req.body;

  debug.log("📝 Received theme update:", { theme });

  try {
    const row = await updateRow(
      `UPDATE general SET "theme" = $1 WHERE id = 1 RETURNING *`,
      [{ value: theme }],
    );

    if (!row) return res.status(404).json({ error: "Record not found" });

    const savedValue = row.theme;

    debug.log("✅ Saved theme from DB:", savedValue);

    saveCachedConfig({ theme: savedValue });

    res.json({ theme: savedValue });
  } catch (err) {
    console.error("Error updating theme:", err);
    res.status(500).json({ error: "Failed to update theme" });
  }
});
//#endregion

module.exports = router;
