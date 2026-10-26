const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const { isAuth } = require("../middleware/auth");

const router = Router();

//#region ===== FILES =====
//#region === STORAGE CONFIG ===
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadDir, "patients", req.params.id);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, "") + ext;
    const fullPath = path.join(uploadDir, "patients", req.params.id, safeName);

    if (!fs.existsSync(fullPath)) return cb(null, safeName);

    let counter = 1;
    let newName;
    do {
      newName = `${basename} (${counter})${ext}`;
      counter++;
    } while (
      fs.existsSync(path.join(uploadDir, "patients", req.params.id, newName))
    );
    cb(null, newName);
  },
});

const upload = multer({ storage });
//#endregion

// Upload files to a specific patient
router.post(
  "/patients/:id/upload",
  isAuth,
  upload.single("file"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({
        error: "No file uploaded",
      });
    res.status(200).json({
      success: true,
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/patients/${req.params.id}/${req.file.filename}`,
      size: req.file.size,
    });
  },
);

// Get files of a specific patient
router.get("/patients/:id/files", isAuth, async (req, res) => {
  const dir = path.join(uploadDir, "patients", req.params.id);
  try {
    if (!fs.existsSync(dir)) return res.json([]);
    const names = await fsp.readdir(dir);
    const files = await Promise.all(
      names.map(async (fn) => {
        const st = await fsp.stat(path.join(dir, fn));
        return {
          filename: fn,
          originalname: fn,
          path: `/uploads/patients/${req.params.id}/${fn}`,
          size: st.size,
        };
      }),
    );
    res.json(files);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Error reading directory",
    });
  }
});

// Delete patient's file
router.delete("/files", isAuth, async (req, res) => {
  const { filePath } = req.body;
  if (!filePath)
    return res.status(400).json({
      error: "filePath is required",
    });

  const normalized = path
    .normalize(filePath)
    .replace(/^(\.\.[\\/])+/, "")
    .replace(/\\/g, "/");
  const relativePath = normalized.split("uploads/").pop() || normalized;
  const full = path.join(uploadDir, relativePath);

  // Security check
  const rel = path.relative(uploadDir, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return res.status(403).json({
      error: "Access denied",
      message: "Invalid path",
    });
  }

  try {
    await fsp.access(full);
    await fsp.unlink(full);
    res.json({
      success: true,
      message: "Deleted",
      path: normalized,
    });
  } catch (e) {
    console.error("Deletion error:", e);
    if (e.code === "ENOENT")
      return res.status(404).json({
        error: "Not found",
        requestedPath: normalized,
        actualSearchedPath: full,
      });
    if (e.code === "EPERM")
      return res.status(403).json({
        error: "Permission denied",
        message: e.message,
      });
    if (e.code === "EISDIR")
      return res.status(400).json({
        error: "Path is a directory",
        message: e.message,
      });
    res.status(500).json({
      error: "Internal server error",
      message: e.message,
    });
  }
});
//#endregion

module.exports = router;
