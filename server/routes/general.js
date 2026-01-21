const { Router } = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getCachedConfig, saveCachedConfig } = require("../utils/cacheHelpers");
const { updateRow, fetchRow } = require("../utils/dbUtils");
const debug = require("../utils/debug");

const router = Router();

router.get("/config", async (req, res) => {
  try {
    const cached = getCachedConfig();
    if (cached) return res.json(cached);

    const row = await fetchRow(`
    SELECT title, "headerColor", "contentColor", "containerColor", theme
    FROM general 
    WHERE id = 1
  `);

    const fullConfig = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      theme: row.theme,
    };

    saveCachedConfig(fullConfig);
    res.json(fullConfig);
  } catch (err) {
    console.error("Error fetching config:", err);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});
router.put("/config", async (req, res) => {
  const { title, headerColor, contentColor, containerColor, theme } = req.body;

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
      RETURNING title, "headerColor", "contentColor", "containerColor", theme
    `;

    const row = await updateRow(query, paramValues);

    if (!row) return res.status(404).json({ error: "Record not found" });

    const fullConfig = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      theme: row.theme,
    };

    saveCachedConfig(fullConfig);

    debug.log("Config partially updated:", fullConfig);

    res.json(fullConfig);
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

module.exports = router;
