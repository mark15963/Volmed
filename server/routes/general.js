const { Router } = require("express");
const { db } = require("../config/db-connection");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  getCachedConfig,
  saveCachedConfig,
} = require("../utils/cacheHelpers");

const router = Router();

//#region ===== Routes =====
// ----- Title -----
router.get("/title", async (req, res) => {
  try {
    const cached = getCachedConfig();
    if (cached?.title) {
      return res.json(cached.title);
    }

    const row = await fetchRow(
      'SELECT "topTitle", "bottomTitle" FROM general WHERE id = 1'
    );
    if (!row) return res.status(404).json({ error: "Data not found" });

    const data = {
      topTitle: row.topTitle,
      bottomTitle: row.bottomTitle,
    };
    saveCachedConfig({ title: data });

    res.json(data);
  } catch (err) {
    console.error("Error fetching title:", err);
    res.status(500).json({ error: "Failed to fetch title" });
  }
});
router.put("/title", async (req, res) => {
  const { topTitle, bottomTitle } = req.body;

  try {
    const row = await updateRow(
      `UPDATE general SET "topTitle" = $1, "bottomTitle" = $2 WHERE id = 1 RETURNING *`,
      [{ value: topTitle }, { value: bottomTitle }],
      [{ index: 0, name: "Top title" }] // Required
    );
    if (!row) return res.status(404).json({ error: "Record not found" });

    const data = { topTitle: row.topTitle, bottomTitle: row.bottomTitle };
    saveCachedConfig({ title: data });

    res.json(data);
  } catch (err) {
    console.error("Error updating title:", err);
    res.status(500).json({ error: "Failed to update title" });
  }
});
// ----- Color -----
router.get("/color", async (req, res) => {
  try {
    const cached = getCachedConfig();
    if (cached?.color) {
      return res.json(cached.color);
    }
    const row = await fetchRow(
      'SELECT "headerColor", "contentColor" FROM general WHERE id = 1'
    );
    if (!row) return res.status(404).json({ error: "Data not found" });

    const data = {
      headerColor: row.headerColor,
      contentColor: row.contentColor,
    };
    saveCachedConfig({ color: data });

    res.json(data);
  } catch (err) {
    console.error("Error fetching color:", err);
    res.status(500).json({ error: "Failed to fetch color" });
  }
});
router.put("/color", async (req, res) => {
  const { headerColor, contentColor } = req.body;

  try {
    const row = await updateRow(
      'UPDATE general SET "headerColor" = $1, "contentColor" = $2 WHERE id = 1 RETURNING *',
      [{ value: headerColor }, { value: contentColor }],
      [
        { index: 0, name: "Header color" }, // Required
        { index: 1, name: "Content color" }, // Required
      ]
    );
    if (!row) return res.status(404).json({ error: "Record not found" });

    const data = {
      headerColor: row.headerColor,
      contentColor: row.contentColor,
    };
    saveCachedConfig({ color: data });

    res.json(data);
  } catch (err) {
    console.error("Error updating color:", err);
    res.status(500).json({ error: "Failed to update color" });
  }
});

// ---- Logo Upload ----
// Define permanent upload location (client's public assets folder)
const publicDir = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "public",
  "assets",
  "images"
);
const srcDir = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "src",
  "assets",
  "images"
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
      (f) => f.startsWith("logo.") && fs.unlinkSync(path.join(publicDir, f))
    );

    cb(null, "logo" + ext);
  },
});

const upload = multer({ storage });

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

module.exports = router;
