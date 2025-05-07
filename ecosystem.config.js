module.exports = {
  apps: [
    {
      name: "bookish",
      script: "app.js",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}

