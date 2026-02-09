//#region === REQUIREMENTS ===
const { Router } = require("express");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const multer = require("multer");
const { getCacheConfig, setCacheConfig } = require("../utils/cache.ts");
const { updateRow, fetchRow } = require("../utils/dbUtils");
const debug = require("../utils/debug");
//#endregion

//#region === SETUP & CONFIGS ===
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/uploads/assets/images";
const LOGO_FILENAME_PREFIX = "logo";
const DEFAULT_LOGO_EXT = ".webp";
const LOGO_URL_BASE = "/assets/images";
const DB_CONFIG_ID = 1;
//#endregion

//#region === UTILS FUNCTIONS ===
/**
 * Ensures the upload directory exists, creating it if necessary
 * @throws {Error} If directory creation fails
 */
async function ensureUploadDirectory() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    debug.log(`Created upload directory: ${UPLOAD_DIR}`);
  }
}

/**
 * Cleans up old logo files from the upload directory
 * @returns {Promise<void>}
 */
async function cleanupOldLogos() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const deletionPromises = files
      .filter((file) => file.startsWith(LOGO_FILENAME_PREFIX))
      .map(async (file) => {
        try {
          await fs.unlink(path.join(UPLOAD_DIR, file));
          debug.log(`Removed old logo: ${file}`);
        } catch (error) {
          debug.error(`Failed to remove logo ${file}:`, error);
        }
      });
    await Promise.all(deletionPromises);
  } catch (error) {
    if (error.code !== "ENOENT") {
      debug.error("Error cleaning old logos:", error);
    }
  }
}

/**
 * Gets the appropriate file extension from an uploaded file
 * @param {string} originalName - Original filename
 * @returns {string} Normalized file extension
 */
function getNormalizedExtention(originalName) {
  const extention = path.extname(originalName).toLowerCase();
  return extention || DEFAULT_LOGO_EXT;
}

/**
 * Builds configuration object from database row
 * @param {Object} row - Database row
 * @returns {Object} Formatted configuration
 */
function buildConfigFromRow(row) {
  return {
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
}
//#endregion

//#region === MULTER CONFIG ===
/**
 * Multer storage configuration for handling logo uploads
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: async (req, file, callback) => {
    try {
      const ext = getNormalizedExtention(file.originalname);
      await cleanupOldLogos();
      callback(null, `${LOGO_FILENAME_PREFIX}${ext}`);
    } catch (err) {
      const ext = getNormalizedExtention(file.originalname);
      const timestamp = Date.now();
      callback(null, `${LOGO_FILENAME_PREFIX}-${timestamp}${ext}`);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5Mb limit
  },
  fileFilter: (req, file, callback) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExt.includes(ext)) {
      callback(null, true);
    } else {
      callback(
        new Error(`Invalid file type. Allowed: ${allowedExt.join(", ")}`),
      );
    }
  },
});
//#endregion

//#region === ROUTER SETUP ===
const router = Router();

// Initialize upload directory on setup
ensureUploadDirectory().catch((error) => {
  debug.error("Failed to initialize upload directory:", error);
});
//#endregion

//#region === ROUTE HANDLERS ===
/**
 * GET /config
 * Retrieves application configuration from cache or database
 */
router.get("/config", async (req, res) => {
  try {
    // Get data from cache
    const cachedConfig = await getCacheConfig();
    if (cachedConfig) return res.json(cachedConfig);

    // fetch from DB
    debug.log("Cache missing - Fetching configs from DB");
    const row = await fetchRow(`
      SELECT *
      FROM general 
      WHERE id = ${DB_CONFIG_ID}
    `);

    if (!row) {
      return res.status(404).json({
        error: "Config not found in DB",
      });
    }
    const config = buildConfigFromRow(row);
    await setCacheConfig(config);

    debug.success("Config fetched from DB and cached");
    res.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({
      error: "Failed to fetch config",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * PUT /config
 * Updates application configuration
 * - Update DB -> update cache
 */
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

  // Validate at least one field is provided
  const hasUpdates = [
    title,
    headerColor,
    contentColor,
    containerColor,
    tableTheme,
    appTheme,
  ].some((field) => field !== undefined);

  if (!hasUpdates) {
    return res.status(400).json({
      error: "No fields provided to update",
    });
  }

  try {
    const updates = [];
    let params = [];

    const fields = [
      { name: "title", value: title },
      { name: "headerColor", value: headerColor },
      { name: "contentColor", value: contentColor },
      { name: "containerColor", value: containerColor },
      { name: "logoUrl", value: logoUrl },
      { name: "tableTheme", value: tableTheme },
      { name: "appTheme", value: appTheme },
    ];

    fields.forEach((field) => {
      if (field.value !== undefined) {
        updates.push(`"${field.name}" = $${updates.length + 1}`);
        params.push(field.value);
      }
    });

    const query = `
      UPDATE general
      SET ${setParts.join(", ")}
      WHERE id = $${params.length + 1}
      RETURNING *
    `;

    params.push(DB_CONFIG_ID);

    const updatedRow = await updateRow(query, params);

    if (!updatedRow) {
      return res.status(404).json({
        error: "Config record not found",
      });
    }

    const updatedConfig = buildConfigFromRow(updatedRow);
    await setCacheConfig(updatedConfig);

    debug.success("Config updated:", updatedConfig);
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({
      error: "Failed to update config",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /upload-logo
 * Uploads and processes a new logo file
 */
router.post("/upload-logo", upload.single("logo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded",
      details: "Please select a logo file to upload",
    });
  }

  try {
    const timestamp = Date.now();
    const logoUrl = `${LOGO_URL_BASE}/${req.file.filename}?t=${timestamp}`;

    const currentConfig = await getCacheConfig();
    if (currentConfig) {
      const updatedConfig = {
        ...currentConfig,
        logoUrl,
      };
      await setCacheConfig(updatedConfig);
    }

    debug.success(`Logo uploaded: ${req.file.filename}`);
    res.json({
      logoUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    debug.error("Failed to process logo upload:", error);
    res.status(500).json({
      error: "Failed to process logo upload",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * GET /get-logo
 * Retrieves the current logo URL
 */
router.get("/get-logo", async (req, res) => {
  try {
    debug.log(`Checking for logo in: ${UPLOAD_DIR}`);

    await ensureUploadDirectory();

    const files = fs.readdirSync(UPLOAD_DIR);
    debug.log(`Found ${files.length} files in dir`);

    const logoFile = files.find((f) => f.startsWith(LOGO_FILENAME_PREFIX));

    if (logoFile) {
      const logoUrl = `${LOGO_URL_BASE}/${logoFile}?t=${Date.now()}`;
      debug.success(`Found logo: ${logoFile}`);
      return res.json({ logoUrl });
    }

    debug.log("No logo file found");
    res.json({ logoUrl: null });
  } catch (error) {
    debug.error("Failed to retrieve logo:", error);
    res.status(500).json({
      error: "Failed to retrieve logo",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
//#endregion

module.exports = router;
