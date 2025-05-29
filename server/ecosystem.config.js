module.exports = {
  apps: [
    {
      name: "volmed-server",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // PM2 will send SIGTERM for graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      pmx: true,
    },
  ],
};
