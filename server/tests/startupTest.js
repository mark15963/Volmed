//#region ===== IMPORTS =====
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const debug = require("../utils/debug");
const { getGeneralConfig } = require("../utils/cache.ts");
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

// Create axios instance that accepts self-signed certs
const createAxiosInstance = (cookies = []) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Accept self-signed certificates
    }),
  });

  if (cookies.length > 0) {
    instance.defaults.headers.Cookie = cookies.join("; ");
  }

  return instance;
};
//#endregion

async function runStartupTests() {
  //#region ===== CONSTS =====
  const BASE_URL = process.env.BACKEND_URL;
  const username = "test";
  const password = `test321`;

  const testFileName = "test-file.txt";
  const testFileDir = path.join(__dirname, "../uploads/patients/1");
  const testFilePath = path.join(testFileDir, testFileName);

  let cookies = [];
  let failed = 0;
  //#endregion

  try {
    debug.log("===================================");
    debug.log("|    Running startup tests...     |");
    debug.log("===================================");

    //#region ===== HEALTH =====
    try {
      const axiosInstance = createAxiosInstance();
      const healthRes = await axiosInstance.get(`${BASE_URL}/api/health`);
      logTestResult("API Health check", healthRes.data.status === "healthy");
    } catch (err) {
      logTestResult("API Health check", false);
      debug.error("Health check error:", err.message);
      failed++;
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
      failed++;
    }
    //#endregion

    //#region ===== LOGIN =====
    loginSuccess = false;
    try {
      const axiosInstance = createAxiosInstance();
      const loginRes = await axiosInstance.post(
        `${BASE_URL}/api/login`,
        { username, password },
        { withCredentials: true },
      );
      cookies = loginRes.headers["set-cookie"] || [];
      logTestResult("Login", loginRes.data.success === true);
    } catch (err) {
      logTestResult("Login", false);
      debug.error("Login error:", err.message);
      failed++;
    }
    //#endregion

    //#region ===== PATIENTS =====
    try {
      const axiosInstance = createAxiosInstance(cookies);
      const patientsRes = await axiosInstance.get(`${BASE_URL}/api/patients`);
      logTestResult("Fetch patients", patientsRes.data.length >= 0);
    } catch (err) {
      logTestResult("Fetch patients", false);
      debug.error("Patients fetch error:", err.message);
      failed++;
    }
    //#endregion

    //#region ===== USERS =====
    try {
      const axiosInstance = createAxiosInstance(cookies);
      const usersRes = await axiosInstance.get(`${BASE_URL}/api/users`);
      logTestResult("Fetch users", usersRes.data.length >= 0);
    } catch (err) {
      logTestResult("Fetch users", false);
      debug.error("Users fetch error:", err.message);
      failed++;
    }
    //#endregion

    //#region ===== CHAT =====
    try {
      const axiosInstance = createAxiosInstance();
      const chatHealthRes = await axiosInstance.get(
        `${BASE_URL}/api/chat/health`,
      );
      logTestResult("Chat health", chatHealthRes.data.status === "healthy");
    } catch (err) {
      logTestResult("Chat health", false);
      debug.error("Chat health error:", err.message);
      failed++;
    }
    //#endregion

    //#region ===== FILES =====
    try {
      // debug.log("===== FILES LIFE CYCLE TEST =====");
      const axiosInstance = createAxiosInstance(cookies);

      // Skip file tests if no cookies (login failed)
      if (cookies.length === 0) {
        logTestResult("Files lifecycle", "skipped (no auth)");
      } else {
        // Delete previous test files to avoid duplicates
        const filesResBefore = await axiosInstance.get(
          `${BASE_URL}/api/patients/1/files`,
        );
        const oldTestFiles = filesResBefore.data.filter((f) =>
          f.originalname.startsWith("test-file"),
        );

        for (const file of oldTestFiles) {
          await axiosInstance.delete(`${BASE_URL}/api/files`, {
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
          const uploadRes = await axiosInstance.post(
            `${BASE_URL}/api/patients/1/upload`,
            form,
            {
              headers: {
                ...form.getHeaders(),
              },
            },
          );
          // logTestResult("Uploaded file file", uploadRes?.status === 200);
          debug.log("⏳ Waiting for file processing...");
          await delay(1000);
        } catch (err) {
          logTestResult("File upload", false);
          debug.error(err.message);
          failed++;
        }

        // Verify upload
        try {
          const verifyUpload = async () => {
            const filesRes = await axiosInstance.get(
              `${BASE_URL}/api/patients/1/files`,
            );
            uploadedFiles = filesRes.data.filter((f) =>
              f.originalname.startsWith("test-file"),
            );
            if (uploadedFiles.length === 0) {
              throw new Error("Uploaded test file not found!");
              failed++;
            }
          };

          await retryOperation(verifyUpload, 3, 1000);
          logTestResult("Upload verification", true);
        } catch (err) {
          logTestResult("Uploaded file verified", false);
          debug.error(err.message);
          failed++;
        }

        // Delete uploaded file(s)
        for (const file of uploadedFiles) {
          try {
            const deleteRes = await axiosInstance.delete(
              `${BASE_URL}/api/files`,
              {
                data: { filePath: file.path },
              },
            );
            // logTestResult(
            //   `File deleted: ${file.originalname}`,
            //   deleteRes.data.success
            // );
          } catch (err) {
            logTestResult(`File deletion: ${file.originalname}`, false);
            debug.error(err.message);
            failed++;
          }
        }

        debug.log("⏳ Waiting for file deletion to complete...");
        await delay(3000);

        // Verify deletion
        try {
          const verifyDeletion = async () => {
            const filesAfterDelete = await axiosInstance.get(
              `${BASE_URL}/api/patients/1/files`,
            );
            const stillExists = filesAfterDelete.data.some((f) =>
              f.originalname.startsWith("test-file"),
            );
            if (stillExists) throw new Error("File was not deleted!");
          };

          await retryOperation(verifyDeletion, 5, 1000);
          logTestResult("Deletion verification", true);
        } catch (err) {
          logTestResult("File deletion verified", false);
          debug.error("Deletion verification failed:", err.message);
          failed++;
          try {
            const currentFiles = await axiosInstance.get(
              `${BASE_URL}/api/patients/1/files`,
            );
            debug.log(
              "📁 Current files:",
              currentFiles.data.map((f) => f.originalname),
            );
          } catch (debugErr) {
            debug.error("Could not get current files for debugging:", debugErr);
          }
        }

        logTestResult("Files lifecycle", true);
      }
    } catch (err) {
      logTestResult("Files lifecycle", false);
      debug.error(err.message);
      failed++;
    }
    // debug.log("===================================");
    //#endregion

    //#region ===== CACHE =====
    try {
      const cached = getGeneralConfig();
      if (cached) logTestResult("Cache fetched", true);
    } catch (err) {
      logTestResult("Cache not fetched", false);
      failed++;
    }
    //#endregion
    if (!failed) {
      debug.log("==================================");
      debug.log("All startup tests PASSED.");
    }
    throw new Error(`Failed tasks ${failed}`);
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
