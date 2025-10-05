const { Router } = require("express");
const { db } = require("../config/db-connection");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = Router();

// --------------------
// Utility Functions
// --------------------
async function fetchRow(query, res, params = []) {
  if (!res) throw new Error("Response object is required");

  try {
    const { rows } = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("DB fetch error:", err);
    res
      .status(500)
      .json({ error: "Database fetch failed", details: err.message });
  }
}
async function updateRow(query, res, params = [], requiredFields = []) {
  if (!res) throw new Error("Response object is required");

  for (const field of requiredFields) {
    if (!params[field.index]) {
      return res.status(400).json({ error: `${field.name} is required` });
    }
  }

  try {
    const { rows } = await db.query(
      query,
      params.map((p) => p.value)
    );
    if (rows.length === 0) {
      return res.status(404).send("Record not found");
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("DB update error:", err);
    res
      .status(500)
      .json({ error: "Database update failed", message: err.message });
  }
}

// ---- General Config Routes ----
// Title
router.get("/title", async (req, res) => {
  fetchRow('SELECT "topTitle", "bottomTitle" FROM general WHERE id = 1', res);
});
router.put("/title", async (req, res) => {
  const { topTitle, bottomTitle } = req.body;

  updateRow(
    `UPDATE general SET "topTitle" = $1, "bottomTitle" = $2 WHERE id = 1 RETURNING *`,
    res,
    [{ value: topTitle }, { value: bottomTitle }],
    [{ index: 0, name: "Top title" }] // Required
  );
});
// Color
router.get("/color", async (req, res) => {
  fetchRow(
    'SELECT "headerColor", "contentColor" FROM general WHERE id = 1',
    res
  );
});
router.put("/color", async (req, res) => {
  const { headerColor, contentColor } = req.body;

  updateRow(
    'UPDATE general SET "headerColor" = $1, "contentColor" = $2 WHERE id = 1 RETURNING *',
    res,
    [{ value: headerColor }, { value: contentColor }],
    [
      { index: 0, name: "Header color" }, // Required
      { index: 1, name: "Content color" }, // Required
    ]
  );
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
      logoUrl: logo ? `/assets/images/${logoFile}?t=${Date.now()}` : null,
    });
  } catch (err) {
    console.error("Failed to get logo:", err);
    res.status(500).json({ error: "Failed to get logo" });
  }
});

module.exports = router;
