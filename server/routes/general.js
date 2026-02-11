const { Router } = require("express");
const fs = require("fs");
const path = require("path");

const uploadDir = process.env.UPLOAD_DIR || "/uploads/assets/images";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
    if (config) return res.json(config);

    // fetch from DB
    debug.log("Cache missing - Fetching from DB");
    const row = await fetchRow(`
      SELECT *
      FROM general 
      WHERE id = 1
    `);

    if (!row) {
      return res.status(404).json({
        error: "Config not found in DB",
      });
    }

    // Build full config obj
    config = {
      title: row.title,
      color: {
        headerColor: row.headerColor,
        contentColor: row.contentColor,
        containerColor: row.containerColor,
      },
      theme: {
        tableTheme: row.tableTheme,
        appTheme: row.appTheme,
      },
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
  const {
    title,
    headerColor,
    contentColor,
    containerColor,
    logoUrl,
    tableTheme,
    appTheme,
  } = req.body;

  // No fields provided
  if (
    title === undefined &&
    headerColor === undefined &&
    contentColor === undefined &&
    containerColor === undefined &&
    tableTheme === undefined &&
    appTheme === undefined
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

    if (tableTheme !== undefined) {
      setParts.push(`"tableTheme" = $${setParts.length + 1}`);
      paramValues.push(tableTheme);
    }

    if (appTheme !== undefined) {
      setParts.push(`"appTheme" = $${setParts.length + 1}`);
      paramValues.push(appTheme);
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
      theme: {
        tableTheme: row.tableTheme,
        appTheme: row.appTheme,
      },
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
// const publicDir = path.join(
//   __dirname,
//   "..",
//   "..",
//   "client",
//   "public",
//   "assets",
//   "images",
// );
// const srcDir = path.join(
//   __dirname,
//   "..",
//   "..",
//   "client",
//   "src",
//   "assets",
//   "images",
// );

// Ensure directories exist
// fs.mkdirSync(publicDir, { recursive: true });
// fs.mkdirSync(srcDir, { recursive: true });

// Configure multer to save directly there
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".webp";
    // remove any old logo.* file
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.readdirSync(uploadDir).forEach(
          (f) =>
            f.startsWith("logo.") && fs.unlinkSync(path.join(uploadDir, f)),
        );
      }
    } catch (err) {
      console.error("Error cleaning old logos:", err);
    }
    cb(null, "logo" + ext);
  },
});

const upload = multer({ storage });

//#region ===== Logo routes =====
router.post("/upload-logo", upload.single("logo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // const srcPath = path.join(srcDir, req.file.filename);
  // fs.copyFileSync(path.join(publicDir, req.file.filename), srcPath);

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
    console.log("Upload directory path:", uploadDir);
    console.log("Directory exists:", fs.existsSync(uploadDir));

    // Look for an existing logo file in the assets folder
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating upload directory...");
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ logoUrl: null, message: "Directory created" });
    }

    const files = fs.readdirSync(uploadDir);
    console.log("Files in upload directory:", files);

    const logo = files.find((f) => f.startsWith("logo."));
    console.log("Found logo file:", logo);

    res.json({
      logoUrl: logo ? `/assets/images/${logo}?t=${Date.now()}` : null,
    });
  } catch (err) {
    console.error("Failed to get logo:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to get logo", details: err.message });
  }
});
//#endregion
//#endregion

module.exports = router;
