const axios = require("axios");
const fs = require("fs");
const path = require("path");
const debug = require("../utils/debug");

async function runStartupTests() {
  const BASE_URL = process.env.BACKEND_URL;
  const username = "test";
  const password = "test321";

  try {
    debug.log("Running startup tests...");
    debug.log("========================");

    debug.log(BASE_URL);

    // HEALTH
    const healthRes = await axios.get(`${BASE_URL}/api/health`);
    debug.log("API Health check:", healthRes.data.status);

    // ENV
    debug.log("Mode:", process.env.NODE_ENV);
    const envFilePath = path.join(__dirname, "..", ".env");
    const envFileContent = fs.readFileSync(envFilePath, "utf8");
    const envKeys = Object.keys(process.env);
    const envFileKeys = envFileContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.split("=")[0].trim());
    debug.log("Loaded server environment file variables:", envFileKeys);

    // LOGIN
    const loginRes = await axios.post(
      `${BASE_URL}/api/login`,
      { username, password },
      { withCredentials: true }
    );
    debug.log("Login:", loginRes.data.message);
    const cookies = loginRes.headers["set-cookie"];

    // PATIENTS
    const patientsRes = await axios.get(`${BASE_URL}/api/patients`, {
      headers: { Cookie: cookies.join("; ") },
    });
    debug.log(`Patients fetched: ${patientsRes.data.length || 0}`);

    // USERS
    const usersRes = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Cookie: cookies.join("; ") },
    });
    debug.log(`Users fetched: ${usersRes.data.length || 0}`);

    // CHAT
    const chatHealthRes = await axios.get(`${BASE_URL}/api/chat/health`);
    debug.log(`Chat health: ${chatHealthRes.data.status}`);

    debug.log("=========================");
    debug.log("All startup tests PASSED.");
  } catch (error) {
    debug.error("startup test failed:");
    if (error.response) {
      debug.error("Status:", error.response.status);
      debug.error("Data:", error.response.data);
    } else {
      debug.error("Error:", error.message);
    }
    process.exit(1);
  }
}

runStartupTests();
