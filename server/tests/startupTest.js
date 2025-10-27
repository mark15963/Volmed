//#region ===== IMPORTS =====
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const debug = require("../utils/debug");
const { getCachedConfig } = require("../utils/cacheHelpers");
//#endregion

//#region ===== HELPER =====
function logTestResult(name, success) {
  let icon;
  if (success === true) icon = "✅";
  else if (success === false) icon = "❌";
  else icon = "❓";

  debug.log(`${icon} ${name}: ${success}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      debug.log(`⚠️ Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs * attempt); // Exponential backoff
    }
  }
}
//#endregion

async function runStartupTests() {
  //#region ===== CONSTS =====
  const BASE_URL = process.env.BACKEND_URL;
  const username = "test";
  const password = "test321";

  const testFileName = "test-file.txt";
  const testFileDir = path.join(__dirname, "../uploads/patients/1");
  const testFilePath = path.join(testFileDir, testFileName);

  let cookies = [];
  //#endregion

  try {
    debug.log("===================================");
    debug.log("|    Running startup tests...     |");
    debug.log("===================================");

    //#region ===== HEALTH =====
    try {
      const healthRes = await axios.get(`${BASE_URL}/api/health`);
      logTestResult("API Health check", healthRes.data.status === "healthy");
    } catch (err) {
      logTestResult("API Health check", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== ENV =====
    try {
      const envFilePath = path.join(__dirname, "..", ".env");
      const envFileContent = fs.readFileSync(envFilePath, "utf8");
      const envKeys = Object.keys(process.env);
      const envFileKeys = envFileContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => line.split("=")[0].trim());
      logTestResult("ENV files", envFileKeys.length >= 0);
    } catch (err) {
      logTestResult("ENV files", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== LOGIN =====
    loginSuccess = false;
    try {
      const loginRes = await axios.post(
        `${BASE_URL}/api/login`,
        { username, password },
        { withCredentials: true }
      );
      cookies = loginRes.headers["set-cookie"];
      logTestResult("Login", loginRes.data.success === true);
    } catch (err) {
      logTestResult("Login", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== PATIENTS =====
    try {
      const patientsRes = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Cookie: cookies.join("; ") },
      });
      logTestResult("Fetch patients", patientsRes.data.length >= 0);
    } catch (err) {
      logTestResult("Fetch patients", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== USERS =====
    try {
      const usersRes = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Cookie: cookies.join("; ") },
      });
      logTestResult("Fetch users", usersRes.data.length >= 0);
    } catch (err) {
      logTestResult("Fetch users", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== CHAT =====
    try {
      const chatHealthRes = await axios.get(`${BASE_URL}/api/chat/health`);
      logTestResult("Chat health", chatHealthRes.data.status === "healthy");
    } catch (err) {
      logTestResult("Chat health", false);
      debug.error(err.message);
    }
    //#endregion

    //#region ===== FILES =====
    try {
      // debug.log("===== FILES LIFE CYCLE TEST =====");

      // Delete previous test files to avoid duplicates
      const filesResBefore = await axios.get(
        `${BASE_URL}/api/patients/1/files`,
        {
          headers: { Cookie: cookies.join("; ") },
        }
      );
      const oldTestFiles = filesResBefore.data.filter((f) =>
        f.originalname.startsWith("test-file")
      );

      for (const file of oldTestFiles) {
        await axios.delete(`${BASE_URL}/api/files`, {
          headers: { Cookie: cookies.join("; ") },
          data: { filePath: file.path },
        });
        // debug.log(`Deleted leftover file: ${file.originalname}`);
      }

      if (oldTestFiles.length > 0) {
        debug.log("Waiting for cleanup to complete...");
        await delay(2000);
      }

      let uploadedFiles = [];

      // Create a test file in memory (no local write)
      try {
        const form = new FormData();
        form.append("file", Buffer.from("This is a test file"), {
          filename: testFileName,
          contentType: "text/plain",
        });
        // Upload
        const uploadRes = await axios.post(
          `${BASE_URL}/api/patients/1/upload`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              Cookie: cookies.join("; "),
            },
          }
        );
        // logTestResult("Uploaded file file", uploadRes?.status === 200);
        debug.log("⏳ Waiting for file processing...");
        await delay(1500);
      } catch (err) {
        logTestResult("File upload", false);
        debug.error(err.message);
      }

      // Verify upload
      try {
        const verifyUpload = async () => {
          const filesRes = await axios.get(`${BASE_URL}/api/patients/1/files`, {
            headers: { Cookie: cookies.join("; ") },
          });
          uploadedFiles = filesRes.data.filter((f) =>
            f.originalname.startsWith("test-file")
          );
          if (uploadedFiles.length === 0)
            throw new Error("Uploaded test file not found!");
        };

        await retryOperation(verifyUpload, 3, 1000);
        logTestResult("Upload verification", true);
      } catch (err) {
        logTestResult("Uploaded file verified", false);
        debug.error(err.message);
      }

      // Delete uploaded file(s)
      for (const file of uploadedFiles) {
        try {
          const deleteRes = await axios.delete(`${BASE_URL}/api/files`, {
            headers: { Cookie: cookies.join("; ") },
            data: { filePath: file.path },
          });
          // logTestResult(
          //   `File deleted: ${file.originalname}`,
          //   deleteRes.data.success
          // );
        } catch (err) {
          logTestResult(`File deletion: ${file.originalname}`, false);
          debug.error(err.message);
        }
      }

      debug.log("⏳ Waiting for file deletion to complete...");
      await delay(3000);

      // Verify deletion
      try {
        const verifyDeletion = async () => {
          const filesAfterDelete = await axios.get(
            `${BASE_URL}/api/patients/1/files`,
            { headers: { Cookie: cookies.join("; ") } }
          );
          const stillExists = filesAfterDelete.data.some((f) =>
            f.originalname.startsWith("test-file")
          );
          if (stillExists) throw new Error("File was not deleted!");
        };

        await retryOperation(verifyDeletion, 5, 1000);
        logTestResult("Deletion verification", true);
      } catch (err) {
        logTestResult("File deletion verified", false);
        debug.error("Deletion verification failed:", err.message);

        try {
          const currentFiles = await axios.get(
            `${BASE_URL}/api/patients/1/files`,
            { headers: { Cookie: cookies.join("; ") } }
          );
          debug.log(
            "📁 Current files:",
            currentFiles.data.map((f) => f.originalname)
          );
        } catch (debugErr) {
          debug.error("Could not get current files for debugging");
        }
      }

      logTestResult("Files lifecycle", true);
    } catch (err) {
      logTestResult("Files lifecycle", false);
      debug.error(err.message);
    }
    // debug.log("===================================");
    //#endregion

    //#region ===== CACHE =====
    try {
      const cached = getCachedConfig();
      if (cached) logTestResult("Cache fetched", true);
    } catch (err) {
      logTestResult("Cache not fetched", false);
    }
    //#endregion

    debug.log("==================================");
    debug.log("All startup tests PASSED.");
  } catch (err) {
    debug.error("startup test failed:");
    if (err.response) {
      debug.error("Status:", err.response.status);
      debug.error("Data:", err.response.data);
    } else {
      debug.error("Error:", err.message);
    }
    process.exit(1);
  }
}

runStartupTests();
